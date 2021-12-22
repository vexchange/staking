import { Subtitle, Title, PrimaryText } from '../../design'
import useVexData from '../../hooks/useVexData'
import { formatCurrency } from '../../utils'
import { ExternalIcon } from '../Icons'
import {
  OverviewContainer,
  OverviewDescription,
  OverviewInfo,
  OverviewKPI,
  OverviewKPIContainer,
  OverviewLabel,
  OverviewTag,
  UnderlineLink,
} from './styled'

export default function Overview() {
  const { usdPerVex } = useVexData()

  return (
    <OverviewContainer>
      <OverviewInfo>
        <OverviewTag>
          <Subtitle style={{ textTransform: 'uppercase' }}>
            Staking on Vexchange
          </Subtitle>
        </OverviewTag>
        <Title className="mt-3 w-100">Liquidity Mining Program</Title>
        <OverviewDescription className="mt-3 w-100">
          The program aims to incentivize VEX liquidity, expand the voting power to those who miss out on the airdrop and to distribute the governance token to those who have the most skin in the game.
        </OverviewDescription>
        <UnderlineLink
          href="https://medium.com/@vexchange/vex-launch-information-9e14b9da4b64"
          target="_blank"
          rel="noreferrer noopener"
        >
          <div className="d-flex mt-4">
            <PrimaryText fontSize={14} className="mr-2">
              Read more about the VEX token
            </PrimaryText>
            <ExternalIcon color="white" />
          </div>
        </UnderlineLink>
      </OverviewInfo>
      <OverviewKPIContainer>
        <OverviewKPI>
          <OverviewLabel>VEX Price</OverviewLabel>
          <Title>{usdPerVex === 0 ? 'Loading...' : formatCurrency(usdPerVex)}</Title>
        </OverviewKPI>
        {/* <OverviewKPI>
          <OverviewLabel>USD Value Staked</OverviewLabel>
          <Title>{usdValueStaked}</Title>
        </OverviewKPI> */}
      </OverviewKPIContainer>
    </OverviewContainer>
  )
}
