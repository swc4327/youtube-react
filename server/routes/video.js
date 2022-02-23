const express = require("express");
const router = express.Router();
const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber");

const { auth } = require("../middleware/auth");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //파일 저장 경로
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    //저장시 파일이름
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    //
    const ext = path.extname(file.originalname);
    if (ext !== ".mp4" || ext !== ".png") {
      //파일형식
      return cb(res.status(400).end("only jpg, png, mp4 is allowed"), false);
    }
    cb(null, true);
  },
});

const upload = multer({ storage: storage }).single("file");

//=================================
//             Video
//=================================

router.post("/uploadfiles", (req, res) => {
  //비디오를 서버에 저장
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.json({
      success: true,
      url: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

router.post("/getVideoDetail", (req, res) => {
  Video.findOne({ _id: req.body.videoId })
    .populate("writer")
    .exec((err, video) => {
      if (err) return res.status(400).send(err);
      res.status(200).json({ success: true, video });
    });
});

router.post("/uploadVideo", (req, res) => {
  const video = new Video(req.body);
  console.log(video);
  video.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    res.status(200).json({ success: true });
  });
});

router.get("/getVideos", (req, res) => {
  //모든 Video 가져오기
  //writer 모든 정보 가져오려면 populate
  Video.find()
    .populate("writer")
    .exec((err, videos) => {
      if (err) return res.status(400).send(err);
      res.status(200).json({ success: true, videos });
    });
});

router.get("/getSubscriptionVideos", (req, res) => {
  // 자신의 아이디로 구독하는 사람 찾기
  Subscriber.find({ userFrom: req.query.userFrom }).exec(
    (err, subscriberInfo) => {
      if (err) return res.status(400).send(err);

      let subscribedUser = [];

      // 내가 구독하는 사람들 담기
      subscriberInfo.map((subscriber, i) => {
        subscribedUser.push(subscriber.userTo);
      });
      // 찾은 사람들의 비디오 가져오기
      Video.find({ writer: { $in: subscribedUser } })
        .populate("writer") //writer의 모든 정보, 즉 User의 모든 정보 가져오기
        .exec((err, videos) => {
          if (err) return res.status(400).send(err);
          res.status(200).json({ success: true, videos, subscriberInfo, subscribedUser});
        });
    }
  );
});

router.post("/thumbnail", (req, res) => {
  //썸네일 생성, 비디오 러닝타임 가져오기

  let filePath = "";
  let fileDuration = "";

  //비디오 정보 가져오기
  ffmpeg.ffprobe(req.body.url, function (err, metadata) {
    console.dir(metadata);
    console.log(metadata.format.duration);
    fileDuration = metadata.format.duration;
  });

  //썸네일 생성
  ffmpeg(req.body.url) //클라이언트에서 온 비디오 저장 경로
    .on("filenames", function (filenames) {
      console.log("Will generate " + filenames.join(", "));
      console.log(filenames);

      filePath = "uploads/thumbnails/" + filenames[0];
    }) //썸네일 생성

    .on("end", function () {
      console.log("Screenshots taken");
      return res.json({
        success: true,
        url: filePath,
        fileDuration: fileDuration,
      });
    })
    .on("error", function (err) {
      console.error(err);
      return res.json({ success: false, err });
    })
    .screenshots({
      //3개의 썸네일
      count: 3,
      folder: "uploads/thumbnails",
      size: "320x240",
      filename: "thumbnail-%b.png",
    });
});

module.exports = router;
