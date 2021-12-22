import { useCallback, useState, useMemo } from "react";
import { find } from "lodash";
import Image from "next/image";
import { formatBigNumber } from "../../utils";
import MultiRewards from "../../constants/abis/MultiRewards.js";
import { useTransactions } from "../../context/transactions";
import { useAppContext } from "../../context/app";

import {
  BaseModalContentColumn,
  BaseUnderlineLink,
  SecondaryText,
} from "../../design";
import colors from "../../design/colors";

import { ActionButton } from "../Button";
import VEXClaimModalContent from "../VEXModalClaimContent";
import Modal from "../Modal";
import { ExternalIcon } from "../Icons";

import { AssetTitle, InfoColumn, InfoData, LogoContainer } from "./styled";

export default function ClaimModal({
  show,
  onClose,
  stakingPoolData,
  vaultOption,
}) {
  const { addTransaction } = useTransactions();
  const { connex, connexStakingPools, ticker } = useAppContext();
  const [step, setStep] = useState("info");

  const handleClose = useCallback(() => {
    onClose();
    if (step === "claim" || step === "claimed") {
      setStep("info");
    }
  }, [onClose, step]);

  const handleClaim = useCallback(async () => {
    setStep("claim");

    const getRewardABI = find(MultiRewards, { name: "getReward" });
    const method =
      connexStakingPools[vaultOption.id].rewardsContract.method(getRewardABI);
    const clause = method.asClause();

    try {
      const response = await connex.vendor
        .sign("tx", [clause])
        .comment(
          `Claim reward`
        )
        .request();

      setStep("claiming");

      const txhash = response.txid;

      addTransaction({
        txhash,
        type: "rewardClaim",
        stakeAsset: vaultOption.stakeAsset,
      });

      const txVisitor = connex.thor.transaction(txhash);
      let txReceipt = null;
      while (!txReceipt) {
        await ticker.next();
        txReceipt = await txVisitor.getReceipt();
      }

      setStep("claimed");
    } catch (err) {
      console.error("error", err);
      setStep("info");
    }
  }, [addTransaction, connex, stakingPoolData, vaultOption]);

  const body = useMemo(() => {
    const color = colors.orange;
    let disableClaimButton = true;
    switch (step) {
      case "info":
        return (
          <>
            <BaseModalContentColumn>
              <LogoContainer>
                <Image
                  src={vaultOption.stakeAssetLogo}
                  alt={vaultOption.stakeAsset}
                  width={40}
                  height={37}
                />
              </LogoContainer>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={8}>
              <AssetTitle str={vaultOption.stakeAsset}>
                {vaultOption.stakeAsset}
              </AssetTitle>
            </BaseModalContentColumn>
            <InfoColumn marginTop={40}>
              {stakingPoolData.userData.claimableRewardTokens.map(
                (claimableRewardToken) => {
                  const name = Object.keys(claimableRewardToken)[0]
                  const amount = claimableRewardToken[name]

                  if (amount > 0) {
                    disableClaimButton = false;
                  }

                  return (
                    <div key={name}>
                      <SecondaryText>Unclaimed {name} </SecondaryText>
                      <InfoData>{formatBigNumber(amount)}</InfoData>
                    </div>
                  );
                }
              )}
            </InfoColumn>
            <BaseModalContentColumn marginTop="auto">
              <BaseUnderlineLink
                href="https://medium.com/@vexchange/vex-launch-information-9e14b9da4b64"
                target="_blank"
                rel="noreferrer noopener"
                className="d-flex align-items-center"
              >
                <>
                  <SecondaryText>Read about $VEX</SecondaryText>
                  <ExternalIcon className="ml-1" />
                </>
              </BaseUnderlineLink>
            </BaseModalContentColumn>
            <BaseModalContentColumn>
              <ActionButton
                className="btn py-3 mb-2"
                onClick={handleClaim}
                color={color}
                disabled={disableClaimButton}
              >
                {"Claim"}
              </ActionButton>
            </BaseModalContentColumn>
          </>
        );
      default:
        return <VEXClaimModalContent vaultOption={vaultOption} step={step} />;
    }
  }, [step, vaultOption, stakingPoolData, handleClaim]);

  return (
    <Modal show={show} onClose={handleClose} height={450}>
      {body}
    </Modal>
  );
}
