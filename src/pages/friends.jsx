import React, { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import clsx from "clsx";
import arrayShuffle from "array-shuffle";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "./about.module.css";

function About() {
  return (
    <Layout>
      <Friends />
      <p style={{ paddingLeft: "20px" }}>
      </p>
    </Layout>
  );
}


function githubPic(name) {
  return `https://github.yuuza.net/${name}.png`;
}

var friendsData = [
  {
    pic: githubPic("ZhmYe"),
    name: "叶哲名",
    intro: "宵宫我老婆",
    url: "https://github.com/ZhmYe",
    note: "ZK 之神！研一 Leader！研一顶梁柱！",
  },
  {
    pic: githubPic("JasonXQH"),
    name: "徐啟航",
    intro: "华东师范大学数据科学与大数据技术专业在读本科生",
    url: "https://github.com/JasonXQH",
    note: "可编辑区块链项目负责人！",
  },
  {
    pic: githubPic("YeexiaoZheng"),
    name: "郑逸潇",
    intro: "Student of East China Normal University 华东师范大学 有什么问题可以在对应repository提issue，紧急的话加QQ：1102100299（问前在对应的repository点个star吧uu们",
    url: "https://github.com/YeexiaoZheng",
    note: "ZKSQL，年底 CCF A 预定",
  },
  {
    pic: githubPic("kdai-910hr"),
    name: "甄逸飞",
    intro: "我喜欢搓玻璃",
    url: "https://github.com/kdai-910hr",
    note: "飞诚勿扰",
  },
];

function Friends() {
  const [friends, setFriends] = useState(friendsData);
  useEffect(() => {
    setFriends(arrayShuffle(friends));
  }, []);
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState(0);
  useEffect(() => {
    // After `current` change, set a 300ms timer making `previous = current` so the previous card will be removed.
    const timer = setTimeout(() => {
      setPrevious(current);
    }, 300);

    return () => {
      // Before `current` change to another value, remove (possibly not triggered) timer, and make `previous = current`.
      clearTimeout(timer);
      setPrevious(current);
    };
  }, [current]);
  return (
    <div className={styles.friends} lang="zh-cn">
      <div style={{ position: "relative" }}>
        <div className={styles["friend-columns"]}>
          {/* Big card showing current selected */}
          <div className={styles["friend-card-outer"]}>
            {[
              previous != current && (
                <FriendCard key={previous} data={friends[previous]} fadeout />
              ),
              <FriendCard key={current} data={friends[current]} />,
            ]}
          </div>

          <div className={styles["friend-list"]}>
            {friends.map((x, i) => (
              <div
                key={x.name}
                className={clsx(styles["friend-item"], {
                  current: i == current,
                })}
                onClick={() => setCurrent(i)}
              >
                <img src={x.pic} alt="user profile photo" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FriendCard(props) {
  const { data, fadeout = false } = props;
  return (
    <div
      className={clsx(styles["friend-card"], { [styles["fadeout"]]: fadeout })}
    >
      <div className="card">
        <div className="card__image">
          <img
            src={data.pic}
            alt="User profile photo"
            title="User profile photo"
          />
        </div>
        <div className="card__body">
          <h2>{data.name}</h2>
          <p>
            <big>{data.intro}</big>
          </p>
          <p>
            <small>Comment : {data.note}</small>
          </p>
        </div>
        <div className="card__footer">
          <a href={data.url} className="button button--primary button--block">
            Visit
          </a>
        </div>
      </div>
    </div>
  );
}

export default About;