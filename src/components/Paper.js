import React from 'react';
import { Card, Avatar } from '@douyinfe/semi-ui';
import '@douyinfe/semi-ui/dist/css/semi.min.css';

export function Paper({ title, authors, link, abstract }) {
  return (
    <Card
      className='my-semi-card'
      style={{ marginBottom: 12 }}
      bodyStyle={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      title={
        <a href={link} target='_blank'>
          <Card.Meta
            style={{ cursor: "pointer" }}
            title={title}
            description={authors}
            avatar={
              <Avatar
                shape="square"
                alt='ICON'
                size="default"
                src='/img/paper.png'
              />
            }
          />
        </a>
      }
    >
      <p style={{ hyphens: "auto", color: "var(--semi-color-text-0)", marginBottom: 0 }}>
        <strong>Abstract &nbsp;</strong>
        {abstract}
      </p>
    </Card>
  );
}

export default Paper;