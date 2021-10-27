import { useCallback, useState, useMemo } from 'react'
import { find } from 'lodash'

import IERC20 from '../../constants/abis/IERC20.json'
import { getExploreURI } from '../../utils'

import {
  BaseModalContentColumn,
  BaseUnderlineLink,
  FloatingContainer,
  PrimaryText,
  Title,
} from '../../design'
import TrafficLight from "../TrafficLight";

import { useAppContext } from '../../context/app'
import { useTransactions } from '../../context/transactions'

import Modal from '../Modal'
import ApproveModalInfo from '../ApproveModalInfo'
import {REWARDS_ADDRESSES} from "../../constants";

export default function ApproveModal({
  show,
  onClose,
  stakingPoolData,
  vaultOption,
}) {
  const { addPendingTransaction } = useTransactions()
  const { connex, account, stakingTokenContract } = useAppContext()
  const tokenContract = null

  const [step, setStep] = useState('info')
  const [txId, setTxId] = useState('');

  const handleApprove = useCallback(async () => {

    if (!stakingTokenContract) {
      return
    }

    setStep('approve')
    const amount =
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

    try {
      const approveABI = find(IERC20.abi, { name: 'approve' })
      const method = stakingTokenContract.method(approveABI);
      const clause = method.asClause(REWARDS_ADDRESSES.testnet, amount);
      console.log(connex);
      console.log(account);
      console.log(clause);
      const { txid, signer } = await connex.vendor.sign('tx', [clause])
                                      .signer(account) // This modifier really necessary?
                                      .gas(2000000) // This is the maximum
                                      .comment("Sign to approve spending of your LP tokens")
                                      .request();
      console.log('hi3');

      setStep('approving');
      setTxId(txid);
      addPendingTransaction({
        txid,
        type: 'stakingApproval',
        amount: amount,
        stakeAsset: vaultOption,
      });

      const txVisitor = connex.thor.transaction(txid);
      let txReceipt = null;
      const ticker = connex.thor.ticker();

      // Wait for tx to be confirmed and mined
      while(!txReceipt) {
        await ticker.next();
        txReceipt = await txVisitor.getReceipt();
        console.log("txReceipt:", txReceipt);
      }

      setStep('info')
      setTxId('')
      onClose()
    } catch (err) {
      setStep('info')
    }
  }, [addPendingTransaction, onClose, tokenContract, connex, vaultOption])

  const handleClose = useCallback(() => {
    onClose()
    if (step === 'approve') {
      setStep('info')
    }
  }, [step, onClose])

  const body = useMemo(() => {
    switch (step) {
      case 'info':
        return (
          <ApproveModalInfo
            vaultOption={vaultOption}
            stakingPoolData={stakingPoolData}
            onApprove={() => {
              handleApprove();
            }}
          />
        );
      case 'approve':
      case 'approving':
        return (
          <>
            <BaseModalContentColumn marginTop={8}>
              <Title>
                {step === "approve"
                  ? "CONFIRM Approval"
                  : "TRANSACTION PENDING"}
              </Title>
            </BaseModalContentColumn>
            <FloatingContainer>
              <TrafficLight active={step === "approving"} />
            </FloatingContainer>
            {step === "approve" ? (
              <BaseModalContentColumn marginTop="auto">
                <PrimaryText className="mb-2">
                  Confirm this transaction in your wallet
                </PrimaryText>
              </BaseModalContentColumn>
            ) : (
              <BaseModalContentColumn marginTop="auto">
                <BaseUnderlineLink
                  to={`${getExploreURI()}/transactions/${txId}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="d-flex"
                >
                  <PrimaryText className="mb-2">View on Explore</PrimaryText>
                </BaseUnderlineLink>
              </BaseModalContentColumn>
            )}
          </>
        );
    }
  }, [step, vaultOption, handleApprove, txId, stakingPoolData])

  const modalHeight = useMemo(() => {
    if (step === 'info') {
      return stakingPoolData.unstakedBalance.isZero() ? 476 : 504
    }

    return 424
  }, [stakingPoolData, step])

  return (
    <Modal
      show={show}
      onClose={handleClose}
      height={modalHeight}
      headerBackground={step !== 'info'}
    >
      {body}
    </Modal>

  )
}
