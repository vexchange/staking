import Head from 'next/head'
import { Col, Container, Row } from 'react-bootstrap'

import { Overview, Pools } from '../components/Staking'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Farm | Vexchange</title>
        <meta name="description" content="Vexchange yield farming aims to incentivize VEX liquidity, expand the voting power to those who miss out on the airdrop, and distribute the governance token to those who have the most skin in the game." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>" />
      </Head>

      <Container>
        <Row className="justify-content-center">
          <Col sm="12" md="10" lg="8" xl="7" className="d-flex flex-wrap">
            <Overview />
            <Pools />
          </Col>
        </Row>
      </Container>
    </div>
  )
}
