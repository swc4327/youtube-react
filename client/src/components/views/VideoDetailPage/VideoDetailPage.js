import React, { useEffect, useState } from "react";
import { Row, Col, List, Avatar } from "antd";
import axios from "axios";
import SideVideo from "./Sections/SideVideo";
import Subscribe from "./Sections/Subscribe";
import Comments from "./Sections/Comments";


//Video 정보 가져오기
//댓글 리스트 가져오기 -> CommentLists -> 상태관리, Comments Component에 내려주기 / 자식 컴포넌트에서 댓글 달면 refreshFunction으로 넘겨줘서 CommentLists의 상태값 바꿔줌.
function VideoDetailPage(props) {
  const videoId = props.match.params.videoId;
  const variable = { videoId: videoId };

  const [VideoDetail, setVideoDetail] = useState([]);
  const [CommentLists, setCommentLists] = useState([]);

  const videoVariable = {
    videoId: videoId
}

  useEffect(() => {
    axios.post("/api/video/getVideoDetail", variable).then((response) => {
      if (response.data.success) {
        setVideoDetail(response.data.video);
      } else {
        alert("비디오 정보를 가져오기 실패");
      }
    });

    //비디오에 포함된 모든 댓글 가지고 오기
    console.log("#######")
    axios.post("/api/comment/getComments", videoVariable).then((response) => {
      if (response.data.success) {
        console.log('######################')
        console.log("response.data.comments", response.data.comments);
        setCommentLists(response.data.comments);
      } else {
        alert("댓글 가져오기 실패");
      }
    });
  }, []);

  const refreshFunction = (newComment) => {
    setCommentLists(CommentLists.concat(newComment))
  }

  if (VideoDetail.writer) {
    const subscribeButton = VideoDetail.writer._id !==
      localStorage.getItem("userId") && (
      <Subscribe
        userTo={VideoDetail.writer._id}
        userFrom={localStorage.getItem("userId")}
      />
    );

    return (
      <Row gutter={[16, 16]}>
        <Col lg={18} xs={24}>
          <div style={{ width: "100%", padding: "3rem 4rem" }}>
            <video
              style={{ width: "100%" }}
              src={`http://localhost:5000/${VideoDetail.filePath}`}
              controls
            />

            <List.Item actions={[subscribeButton]}>
              <List.Item.Meta
                avatar={<Avatar src={VideoDetail.writer.image} />}
                title={VideoDetail.writer.name}
                description={VideoDetail.description}
              />
            </List.Item>

            <Comments refreshFunction={refreshFunction} commentLists={CommentLists} postId={videoId} />
          </div>
        </Col>

        <Col lg={6} xs={24}>
          <SideVideo />
        </Col>
      </Row>
    );
  } else {
    return <div>Loading...</div>;
  }
}

export default VideoDetailPage;
