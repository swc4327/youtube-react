import React, { useEffect, useState } from "react";
import { Card, Icon, Avatar, Col, Typography, Row } from "antd";
import axios from "axios";
import moment from "moment";

const { Title } = Typography;
const { Meta } = Card;

function LandingPage() {
  const [Video, setVideo] = useState([]);

  //Dom이 최초 업데이트 될 때 한번만
  useEffect(() => {
    axios.get("/api/video/getVideos").then((response) => {
      if (response.data.success) {
        setVideo(response.data.videos);
      } else {
        alert("비디오 가져오기를 실패 했습니다.");
      }
    });
  }, []);

  const renderCards = Video.map((video, index) => {
    var minutes = Math.floor(video.duration / 60);
    var seconds = Math.floor(video.duration - minutes * 60);
    return (
      <Col key={index} lg={6} md={8} xs={24}>
          <div style={{ position: "relative" }}>
          <a href={`/video/${video._id}`}>
            <img
              style={{ width: "100%" }}
              src={`http://localhost:5000/${video.thumbnail}`}
              alt="thumbnail" />
            <div className="duration" style={{ bottom: 0, right:0, position: 'absolute', margin: '4px', 
            color: '#fff', backgroundColor: 'rgba(17, 17, 17, 0.8)', opacity: 0.8, 
            padding: '2px 4px', borderRadius:'2px', letterSpacing:'0.5px', fontSize:'12px',
            fontWeight:'500', lineHeight:'12px' }}>
              <span>
                {minutes} : {seconds}
              </span>
            </div>
        </a>
        </div>
        <br />
        <Meta
          avatar={<Avatar src={video.writer.image} />}
          title={video.title}
          description=""
        />
        <span>{video.writer.name}</span> <br />
        <span style={{ marginLeft: "3rem" }}>{video.views} views</span> -
        <span>{moment(video.createdAt).format("MMM DO YY")}</span>
      </Col>
    );
  });

  return (
    <div style={{ width: "85%", margin: "3rem auto" }}>
      <Title level={2}>Recommended</Title>
      <hr />

      <Row gutter={[32, 16]}>
      {renderCards}
      </Row>
    </div>
  );
}

export default LandingPage;

//  window 크기 가장 클 때 video 하나당 6size, 제일 작을때 24size
