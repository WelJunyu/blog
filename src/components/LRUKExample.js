import React, { useEffect } from 'react';
import { Tabs, TabPane, Pagination, Highlight } from '@douyinfe/semi-ui';
import { IconFilledArrowDown } from '@douyinfe/semi-icons';
import '@douyinfe/semi-ui/dist/css/semi.min.css';

function HL({ content, backgroundColor }) {
  return <Highlight
    sourceString={content + ""}
    searchWords={content + ""}
    highlightStyle={{
      borderRadius: 6,
      marginLeft: 0,
      marginRight: 4,
      paddingLeft: 4,
      paddingRight: 4,
      backgroundColor: backgroundColor,
      color: 'rgba(var(--semi-white), 1)',
      fontFamily: "monospace",
    }}
  />
}

function DescrHL({ content, key }) {
  return <HL content={content} backgroundColor="rgb(163, 110, 215)" />
}

function EvictableHL({ content, key }) {
  return content === 1 ?
    <HL content={"T"} backgroundColor="rgba(var(--semi-green-4), 1)" />
    : <HL content={"F"} backgroundColor="rgba(var(--semi-red-4), 1)" />
}

function MemoryHL({ content, key }) {
  return <HL content={content} backgroundColor="rgba(var(--semi-light-blue-4), 1)" />
}

function HistoryHL({ content, key }) {
  return <HL content={content} backgroundColor="rgba(var(--semi-grey-3), 1)" />
}

function DrawState(prevState, nextState, drawType) {
  function isOP(frame) {
    if (drawType === "prev") {
      return nextState.lop.includes(frame);
    }
    return nextState.rop.includes(frame);
  }

  const drawState = drawType === "prev" ? prevState : nextState;

  return drawState.mem.map((mem, memidx) => {
    return (
      <>
        <div
          className={isOP(mem) ? "lru-k-bg" : ""}
          style={{ paddingLeft: 4.6 }}>
          <EvictableHL content={drawState.evi[memidx]} />
          <MemoryHL content={mem} />
          {drawState.his[memidx].map((his) => {
            return (
              <HistoryHL content={his} />
            )
          })}
        </div >
      </>
    );
  });
}

function Drawing() {
  const [index, setIndex] = React.useState(0);
  const [state, setState] = React.useState(states[0]);
  const [currentPage, setCurrentPage] = React.useState(1);

  const handlePageChange = (page) => {
    setState(states[page - 1]);
    setIndex(page - 1);
    setCurrentPage(page);
  }

  return (
    <>
      <DescrHL content={"紫色"} />：此次操作的描述 <br />
      <HL content={"T"} backgroundColor="rgba(var(--semi-green-4), 1)" /><HL content={"F"} backgroundColor="rgba(var(--semi-red-4), 1)" />：代表该 Frame 是否可被淘汰 <br />
      <MemoryHL content={"蓝色"} />：缓存池中 Frame 的编号<br />
      <HistoryHL content={"灰色"} />：Frame 的访问记录<br />

      <div style={{ display: "flex", justifyContent: "center", height: 240 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}><DescrHL content={state.descr} /> <br /></div>
          <div style={{ display: "flex" }}>
            <div>
              <span style={{ fontWeight: 600 }}>Before:</span>  <br />
              {index === 0 ? "" : DrawState(states[index - 1], states[index], "prev",)}
            </div>
            <div style={{ display: "flex", alignItems: "center", marginLeft: 30 }}>
              <IconFilledArrowDown rotate={270} size="extra-large" style={{ color: "rgb(163, 110, 215)" }} />
            </div>
            <div style={{ marginLeft: 30 }}>
              <span style={{ fontWeight: 600 }}>After:</span>   <br />
              {index === states.length - 1 ? "" : DrawState([], states[index], "next")}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <Pagination
          total={states.length}
          pageSize={1}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          style={{ fontSize: 16 }}
        />
      </div>
    </>
  )
}

export function LRUKExample() {
  return (<Drawing />)
}

export default LRUKExample

const states = [
  {
    descr: "访问 Frame 1，当前时间为 1",
    evi: [0],
    mem: [1],
    his: [
      [1]
    ],
    lop: [],
    rop: [1],
  },
  {
    descr: "访问 Frame 2，当前时间为 2",
    evi: [0, 0],
    mem: [1, 2],
    his: [
      [1],
      [2],
    ],
    lop: [],
    rop: [2],
  },
  {
    descr: "访问 Frame 3，当前时间为 3",
    evi: [0, 0, 0],
    mem: [1, 2, 3],
    his: [
      [1],
      [2],
      [3],
    ],
    lop: [],
    rop: [3],
  },
  {
    descr: "访问 Frame 4，当前时间为 4",
    evi: [0, 0, 0, 0],
    mem: [1, 2, 3, 4],
    his: [
      [1],
      [2],
      [3],
      [4],
    ],
    lop: [],
    rop: [4],
  },
  {
    descr: "访问 Frame 5，当前时间为 5",
    evi: [0, 0, 0, 0, 0],
    mem: [1, 2, 3, 4, 5],
    his: [
      [1],
      [2],
      [3],
      [4],
      [5],
    ],
    lop: [],
    rop: [5],
  },
  {
    descr: "访问 Frame 6，当前时间为 6",
    evi: [0, 0, 0, 0, 0, 0],
    mem: [1, 2, 3, 4, 5, 6],
    his: [
      [1],
      [2],
      [3],
      [4],
      [5],
      [6],
    ],
    lop: [],
    rop: [6],
  },
  {
    descr: "设置 Frame 1~5 为可淘汰的",
    evi: [1, 1, 1, 1, 1, 0],
    mem: [1, 2, 3, 4, 5, 6],
    his: [
      [1],
      [2],
      [3],
      [4],
      [5],
      [6],
    ],
    lop: [1, 2, 3, 4, 5],
    rop: [1, 2, 3, 4, 5],
  },
  {
    descr: "访问 Frame 1，当前时间为 7",
    evi: [1, 1, 1, 1, 0, 1],
    mem: [2, 3, 4, 5, 6, 1],
    his: [
      [2],
      [3],
      [4],
      [5],
      [6],
      [1, 7],
    ],
    lop: [1],
    rop: [1],
  },
  {
    descr: "淘汰页面，优先淘汰 Frame 2",
    evi: [1, 1, 1, 0, 1],
    mem: [3, 4, 5, 6, 1],
    his: [
      [3],
      [4],
      [5],
      [6],
      [1, 7],
    ],
    lop: [2],
    rop: [],
  },
  {
    descr: "淘汰页面，优先淘汰 Frame 3",
    evi: [1, 1, 0, 1],
    mem: [4, 5, 6, 1],
    his: [
      [4],
      [5],
      [6],
      [1, 7],
    ],
    lop: [3],
    rop: [],
  },
  {
    descr: "淘汰页面，优先淘汰 Frame 4",
    evi: [1, 0, 1],
    mem: [5, 6, 1],
    his: [
      [5],
      [6],
      [1, 7],
    ],
    lop: [4],
    rop: [],
  },
  {
    descr: "访问 Frame 3，当前时间为 8",
    evi: [1, 0, 0, 1],
    mem: [5, 6, 3, 1],
    his: [
      [5],
      [6],
      [8],
      [1, 7],
    ],
    lop: [],
    rop: [3],
  },
  {
    descr: "访问 Frame 4，当前时间为 9",
    evi: [1, 0, 0, 0, 1],
    mem: [5, 6, 3, 4, 1],
    his: [
      [5],
      [6],
      [8],
      [9],
      [1, 7],
    ],
    lop: [],
    rop: [4],
  },
  {
    descr: "访问 Frame 5，当前时间为 10",
    evi: [0, 0, 0, 1, 1],
    mem: [6, 3, 4, 1, 5],
    his: [
      [6],
      [8],
      [9],
      [1, 7],
      [5, 10],
    ],
    lop: [5],
    rop: [5],
  },
  {
    descr: "访问 Frame 4，当前时间为 11",
    evi: [0, 0, 1, 1, 0],
    mem: [6, 3, 1, 5, 4],
    his: [
      [6],
      [8],
      [1, 7],
      [5, 10],
      [9, 11],
    ],
    lop: [4],
    rop: [4],
  },
  {
    descr: "设置 Frame 3~4 成为可淘汰的",
    evi: [0, 1, 1, 1, 1],
    mem: [6, 3, 1, 5, 4],
    his: [
      [6],
      [8],
      [1, 7],
      [5, 10],
      [9, 11],
    ],
    lop: [3, 4],
    rop: [3, 4],
  },
  {
    descr: "淘汰页面，优先淘汰 Frame 3",
    evi: [0, 1, 1, 1],
    mem: [6, 1, 5, 4],
    his: [
      [6],
      [1, 7],
      [5, 10],
      [9, 11],
    ],
    lop: [3],
    rop: [],
  },
  {
    descr: "设置 Frame 6 成为可淘汰的",
    evi: [1, 1, 1, 1],
    mem: [6, 1, 5, 4],
    his: [
      [6],
      [1, 7],
      [5, 10],
      [9, 11],
    ],
    lop: [6],
    rop: [6],
  },
  {
    descr: "淘汰页面，优先淘汰 Frame 6",
    evi: [1, 1, 1],
    mem: [1, 5, 4],
    his: [
      [1, 7],
      [5, 10],
      [9, 11],
    ],
    lop: [6],
    rop: [],
  },
  {
    descr: "设置 Frame 1 成为不可淘汰",
    evi: [0, 1, 1],
    mem: [1, 5, 4],
    his: [
      [1, 7],
      [5, 10],
      [9, 11],
    ],
    lop: [1],
    rop: [1],
  },
  {
    descr: "淘汰页面，优先淘汰 Frame 5",
    evi: [0, 1],
    mem: [1, 4],
    his: [
      [1, 7],
      [9, 11],
    ],
    lop: [5],
    rop: [],
  },
  {
    descr: "访问 Frame 1，当前时间为 12",
    evi: [1, 0],
    mem: [4, 1],
    his: [
      [9, 11],
      [7, 12],
    ],
    lop: [1],
    rop: [1],
  },
  {
    descr: "访问 Frame 1，当前时间为 13",
    evi: [1, 0],
    mem: [4, 1],
    his: [
      [9, 11],
      [12, 13],
    ],
    lop: [1],
    rop: [1],
  },
  {
    descr: "设置 Frame 1 成为可淘汰的",
    evi: [1, 1],
    mem: [4, 1],
    his: [
      [9, 11],
      [12, 13],
    ],
    lop: [1],
    rop: [1],
  },
  {
    descr: "淘汰页面，优先淘汰 Frame 4",
    evi: [1],
    mem: [1],
    his: [
      [12, 13],
    ],
    lop: [4],
    rop: [],
  },
  {
    descr: "淘汰页面，优先淘汰 Frame 1",
    evi: [],
    mem: [],
    his: [],
    lop: [1],
    rop: [],
  },
]