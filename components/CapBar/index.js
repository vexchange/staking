import React from 'react'

import { SecondaryText, Title } from '../../design'
import colors from '../../design/colors'
// import { getAssetDisplay } from '../../utils/asset'
import { formatAmount } from '../../utils'

import { BackgroundBar, ForegroundBar } from './styled'

const CapBar = ({
  loading,
  current,
  cap,
  copies = { current: 'Total Deposits', cap: 'Limit' },
  displayData: { current: displayCurrent, cap: displayCap } = {},
  labelConfig = { fontSize: 16 },
  statsConfig = { fontSize: 16 },
  barConfig = { height: 16, extraClassNames: 'my-3', radius: 4 },
  asset,
}) => {
  let percent = +cap > 0 ? +current / +cap : 0;
  if (percent < 0) {
    percent = 0;
  } else if (percent > 1) {
    percent = 1;
  }
  percent *= 100;
  current = +current > +cap ? cap : current;

  return (
    <div className='w-100'>
      <div className='d-flex flex-row justify-content-between'>
        <SecondaryText color={colors.text} fontSize={labelConfig.fontSize}>
          {copies.current}
        </SecondaryText>
        <Title fontSize={statsConfig.fontSize} lineHeight={20}>
          {loading
            ? 'Loading...'
            : `${displayCurrent ? displayCurrent : `$${formatAmount(current)}`
              }`}
        </Title>
      </div>

      <div
        className={`d-flex flex-row position-relative ${barConfig.extraClassNames}`}
      >
        <BackgroundBar height={barConfig.height} radius={barConfig.radius} />
        <ForegroundBar
          height={barConfig.height}
          style={{ width: `${percent}%` }}
          radius={barConfig.radius}
        />
      </div>

      <div className='d-flex flex-row justify-content-between'>
        <SecondaryText color={colors.text} fontSize={labelConfig.fontSize}>
          {copies.cap}
        </SecondaryText>
        <Title fontSize={statsConfig.fontSize} lineHeight={20}>
          {loading
            ? 'Loading...'
            : `${displayCap ? displayCap : `$${formatAmount(cap)}`}`}
        </Title>
      </div>
    </div>
  )
}

export default CapBar