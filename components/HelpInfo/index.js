import React from 'react'

import { SecondaryText } from '../../design'
import colors from '../../design/colors'

import { HelpContainer } from './styled'

const HelpInfo = ({ children, color, ...props }) => {
    return (
      <HelpContainer color={color} {...props}>
        <SecondaryText
          fontSize={10}
          lineHeight={12}
          color={color || colors.text}
        >
          {children}
        </SecondaryText>
      </HelpContainer>
    );
  };

export default HelpInfo;
