import React from 'react';

export function JCQLink({ lec, page }) {
  return (
    <>
      <a target="_blank" href={`/pdf/jcq/${lec}.pdf?#page=${page}`}>{`L${lec}${page ? '-[' + page + ']' : ''}`}</a>
    </>
  );
}

export default JCQLink;