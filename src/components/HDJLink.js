import React from 'react';

export function HDJLink({ lec, page }) {
  return (
    <>
      <a target="_blank" href={`/pdf/hdj/Lec${lec}.pdf?#page=${page}`}>{`L${lec}${page ? '-[' + page + ']' : ''}`}</a>
    </>
  );
}

export default HDJLink;