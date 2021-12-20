import { useCallback, useEffect, useMemo } from "react";
import { ethers, utils } from "ethers";
import { Tooltip } from "react-tippy";
import { calculateAprAndTvl, formatBigNumber } from "../../utils";
import { useAppContext } from "../../context/app";
import { useTransactions } from "../../context/transactions";
import {
  Subtitle,
  BaseIndicator,
  SecondaryText,
  TooltipContainer,
} from "../../design";
import colors from "../../design/colors";
import useTextAnimation from "../../hooks/useTextAnimation";
import useTokenAllowance from "../../hooks/useTokenAllowance";
import CapBar from "../CapBar";
import Image from "next/image";
import HelpInfo from "../HelpInfo";
import {
  ButtonsContainer,
  ClaimableTokenAmount,
  ClaimableTokenPill,
  ClaimableTokenPillContainer,
  LogoContainer,
  PoolCardFooter,
  PoolCardFooterButton,
  PoolCardInfoContainer,
  PoolSubtitle,
  PoolTitle,
  Wrapper,
} from "./styled";

export default function PoolCard({
  stakingPoolData,
  vaultOption,
  setIsStakeAction,
  setShowApprovalModal,
  setShowClaimModal,
  setShowActionModal,
}) {
  const { transactions } = useTransactions();
  const { connex, account, connexStakingPools, initAccount } = useAppContext();
  const { tokenAllowance } = useTokenAllowance(vaultOption);
  let disableClaimButton = true;
  const color = colors.orange;

  // TODO: refactor it
  let apr = 0
  let usdValueStaked = 0
  let usdValuePoolSize = 0
  useEffect(async () => {
    if (!connexStakingPools || !stakingPoolData || !vaultOption || !connex) {
      return;
    }

    const res = await calculateAprAndTvl(
      connex,
      vaultOption,
      stakingPoolData,
      connexStakingPools[vaultOption.id].rewardsContract
    );

    console.log(res)
    if (!res) return

    apr = res.apr
    usdValueStaked = res.usdValueStaked
    usdValuePoolSize = res.usdValuePoolSize
  }, [connexStakingPools, stakingPoolData, vaultOption, connex])


  const ongoingTransaction = useMemo(() => {
    const ongoingTx = (transactions || []).find(
      (currentTx) =>
        ["stakingApproval", "stake", "unstake", "rewardClaim"].includes(
          currentTx.type
        ) &&
        currentTx.stakeAsset === vaultOption.stakeAsset &&
        !currentTx.status
    );

    if (!ongoingTx) {
      return undefined;
    }

    return ongoingTx.type;
  }, [transactions]);

  const actionLoadingTextBase = useMemo(() => {
    switch (ongoingTransaction) {
      case "stake":
        return "Staking";
      case "stakingApproval":
        return "Approving";
      case "unstake":
        return "Unstaking";
      case "rewardClaim":
        return "Claiming";
      default:
        return "Loading";
    }
  }, [ongoingTransaction]);

  const renderUnstakeBalance = useCallback(() => {
    if (!account) {
      return "---";
    }

    return ethers.utils.formatEther(stakingPoolData.userData.unstakedBalance);
  }, [account, stakingPoolData]);

  const primaryActionLoadingText = useTextAnimation(
    Boolean(ongoingTransaction),
    {
      texts: [
        actionLoadingTextBase,
        `${actionLoadingTextBase} .`,
        `${actionLoadingTextBase} ..`,
        `${actionLoadingTextBase} ...`,
      ],
      interval: 250,
    }
  );

  const claimPill = useMemo(() => {
    return (
      <ClaimableTokenPillContainer
        onClick={() => {
          setShowClaimModal(true);
        }}
      >
        {stakingPoolData.userData.claimableRewardTokens.map(
          (claimableRewardToken) => {
            const name = Object.keys(claimableRewardToken)[0];
            const amount = claimableRewardToken[name];

            if (!amount.isZero()) {
              disableClaimButton = false;
            }

            return (
              <ClaimableTokenPill key={name} color={color}>
                <BaseIndicator
                  size={8}
                  color={color}
                  className="mr-2"
                  style={{ marginRight: "5px" }}
                />
                <Subtitle className="mr-2">{name} to claim</Subtitle>
                <ClaimableTokenAmount
                  color={color}
                  style={{ marginLeft: "8px" }}
                >
                  {account ? formatBigNumber(amount) : "---"}
                </ClaimableTokenAmount>
              </ClaimableTokenPill>
            );
          }
        )}
      </ClaimableTokenPillContainer>
    );
  }, [account, color, stakingPoolData]);

  const stakingPoolButtons = useMemo(() => {
    if (!account) {
      return (
        <PoolCardFooterButton
          role="button"
          color={colors.orange}
          onClick={() => {
            initAccount();
          }}
          active={false}
        >
          CONNECT WALLET
        </PoolCardFooterButton>
      );
    }

    const showApprove = tokenAllowance.lt(
      stakingPoolData.userData.unstakedBalance
    );
    const showUnstake = stakingPoolData.userData.currentStake.gt(0);

    return (
      <ButtonsContainer>
        {/*Show approve or stake depending on the balance and allowance*/}
        {showApprove ? (
          // APPROVE
          <PoolCardFooterButton
            role="button"
            color={color}
            onClick={() => {
              setShowApprovalModal(true);
            }}
            active={ongoingTransaction === "approve"}
          >
            {ongoingTransaction === "approve"
              ? primaryActionLoadingText
              : "approve"}
          </PoolCardFooterButton>
        ) : (
          // STAKE
          <PoolCardFooterButton
            role="button"
            color={color}
            onClick={() => {
              setShowActionModal(true);
              setIsStakeAction(true);
            }}
            active={ongoingTransaction === "stake"}
          >
            {ongoingTransaction === "stake"
              ? primaryActionLoadingText
              : "Stake"}
          </PoolCardFooterButton>
        )}

        {/* CLAIM */}
        <PoolCardFooterButton
          role="button"
          color={color}
          onClick={() => {
            setShowClaimModal(true);
          }}
          active={ongoingTransaction === "rewardClaim"}
          hidden={disableClaimButton}
        >
          {ongoingTransaction === "rewardClaim"
            ? primaryActionLoadingText
            : `${disableClaimButton ? "Claim Info" : "Claim"}`}
        </PoolCardFooterButton>

        {/* UNSTAKE */}
        <PoolCardFooterButton
          role="button"
          color={color}
          onClick={() => {
            setShowActionModal(true);
            setIsStakeAction(false);
          }}
          active={ongoingTransaction === "unstake"}
          hidden={!showUnstake}
        >
          {ongoingTransaction === "unstake"
            ? primaryActionLoadingText
            : "Unstake"}
        </PoolCardFooterButton>
      </ButtonsContainer>
    );
  }, [
    account,
    color,
    ongoingTransaction,
    primaryActionLoadingText,
    setShowApprovalModal,
    setShowClaimModal,
    setShowActionModal,
    stakingPoolData,
  ]);

  return (
    <Wrapper color={color}>
      <div className="d-flex flex-wrap w-100 p-3">
        <div className="d-flex w-100 justify-content-between">
          {/* Card Title */}
          <div className="d-flex align-items-center">
            <LogoContainer>
              <Image
                src={vaultOption.stakeAssetLogo}
                alt={vaultOption.stakeAsset}
                width={40}
                height={37}
              />
            </LogoContainer>
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center">
                <PoolTitle>{vaultOption.stakeAsset}</PoolTitle>
                <Tooltip
                  interactive
                  position="top"
                  trigger="mouseenter"
                  html={
                    <TooltipContainer>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: vaultOption.description,
                        }}
                      ></div>
                    </TooltipContainer>
                  }
                >
                  <HelpInfo>i</HelpInfo>
                </Tooltip>
              </div>
              <PoolSubtitle>
                Your Unstaked Balance: {renderUnstakeBalance()}
              </PoolSubtitle>
            </div>
          </div>

          {/* Pool info */}
          <PoolCardInfoContainer color={color}>
            <span>Est. APR:</span>
            <strong>{apr}%</strong>
          </PoolCardInfoContainer>
        </div>

        {/* Claimable Pill */}
        {claimPill}

        <div className="w-100 mt-4">
          <CapBar
            current={usdValueStaked}
            cap={usdValuePoolSize}
            copies={{
              current: "Your Current Stake",
              cap: "Pool Size",
            }}
            labelConfig={{
              fontSize: 14,
            }}
            statsConfig={{
              fontSize: 14,
            }}
            barConfig={{
              height: 8,
              extraClassNames: "my-2",
              radius: 2,
            }}
            vaultOption={vaultOption}
            stakingPoolData={stakingPoolData}
            account={account}
          />
        </div>

        {vaultOption.stakeAssetUrlPart ? (
          <div className="d-flex align-items-center mt-4 w-100">
            <div>
              <SecondaryText size="12px">Need liquidity tokens?</SecondaryText>{" "}
              <SecondaryText size="12px">
                <a
                  className="link"
                  target="_blank"
                  href={`https://vexchange.io/add/${vaultOption.stakeAssetUrlPart}`}
                >
                  Get {vaultOption.stakeAsset} LP tokens
                </a>
              </SecondaryText>
            </div>
          </div>
        ) : null}
      </div>

      <PoolCardFooter>{stakingPoolButtons}</PoolCardFooter>
    </Wrapper>
  )
}
