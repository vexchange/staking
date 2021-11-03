import { useCallback } from 'react'
import { BaseLink, Title } from '../../design'

import {
  FooterContainer,
  LeftContainer,
  LinkItem,
  LinksContainer,
} from './styled'

const DesktopFooter = () => {
  const renderLinkItem = useCallback((title, to) => (
    <BaseLink href={to} target='_blank' rel='noreferrer noopener'>
      <LinkItem>
        <Title fontSize={14} lineHeight={20}>
          {title}
        </Title>
      </LinkItem>
    </BaseLink>
  ), [])

  return (
    <FooterContainer>
      <LeftContainer>
        {renderLinkItem('DOCS', 'https://docs.vexchange.io/docs/v2')}
        {renderLinkItem('BLOG', 'https://medium.com/vexchange')}
      </LeftContainer>
      <LinksContainer>
        {renderLinkItem('TELEGRAM', 'https://t.me/vexchange')}
        {renderLinkItem('TWITTER', 'https://twitter.com/VexchangeIO')}
        {renderLinkItem('GITHUB', 'https://github.com/vexchange')}
      </LinksContainer>
    </FooterContainer>
  );
};

export default DesktopFooter
