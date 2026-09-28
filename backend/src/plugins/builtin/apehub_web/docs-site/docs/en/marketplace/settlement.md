---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'f952955c-9a4b-42a2-9571-6b52de9e93b1'
  PropagateID: 'f952955c-9a4b-42a2-9571-6b52de9e93b1'
  ReservedCode1: '02150d77-a415-40e1-ae7a-d043e507e597'
  ReservedCode2: '02150d77-a415-40e1-ae7a-d043e507e597'
---

# USDT Payment & Settlement

## Purchase

Plugins are priced in USDT; orders are created through the LemPay `usdt` channel. The platform verifies the callback signature, merchant ID, payment type, order amount, product name and the `TRADE_SUCCESS` status. After a successful payment, a permanent plugin entitlement is created.

## Refund Window

The refund window is configured in the admin panel. Refunds revoke the download entitlement. If developer earnings are already available, the platform must apply a corresponding reversal, so the settlement cycle should at least cover the refund risk window.

## Developer Earnings

Orders record the original amount, the platform fee percentage, the platform fee and the developer earnings. After a successful payment, earnings first enter "pending settlement" and can only be withdrawn after the larger of the "settlement cycle" and the "refund window" has passed.

## Withdrawal

- Settlement currency: USDT
- Network: USDT-TRC20
- Minimum amount: configurable in the admin panel, default 100 USDT
- Fee: fixed amount or percentage, configurable in the admin panel
- Payout: manual, by an administrator
- Completion: admins must fill in the TRC20 transaction hash when confirming

Withdrawal status flows as "Pending review → Approved, pending payout → Completed"; rejection releases the frozen balance.