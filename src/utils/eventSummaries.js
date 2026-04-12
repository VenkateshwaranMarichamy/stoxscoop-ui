/**
 * Human-readable summaries for each event type and subtype.
 * Used to display contextual guidance on the Create Event form.
 */

export const EVENT_TYPE_SUMMARIES = {
  corporate_action: 'Actions taken by a company that bring material changes to its stock - e.g. dividends, splits, mergers.',
  disclosure:       'Regulatory disclosures of significant shareholding changes by investors like FIIs, DIIs, or superinvestors.',
  insider:          "Transactions by insiders (promoters, directors, KMPs) in the company's own stock, reported to SEBI.",
  business:         'Key business developments such as new contracts, capacity expansion, JVs, or divestitures.',
  governance:       'Board-level changes, auditor appointments/resignations, regulatory actions, and shareholder meetings.',
  credit_rating:    "Rating actions by agencies like CRISIL, ICRA, or CARE on the company's debt instruments.",
  financials:       'Company financial results (quarterly/annual), guidance updates, and restatements.',
  fundraising:      'Capital raising activities - QIP, IPO, NCD/Bond issuances, rights issues, or debt repayments.',
  legal:            'Legal proceedings, court orders, tax demands, penalties, and settlement outcomes.',
};

export const SUBTYPE_SUMMARIES = {
  // corporate_action
  dividend:            'Company distributes a portion of its earnings to shareholders as cash or stock.',
  bonus:               'Free additional shares issued to existing shareholders in a set ratio.',
  split:               'Face value of shares is reduced, increasing number of shares proportionally.',
  rights_issue:        'Existing shareholders given the right to buy new shares at a discounted price.',
  buyback:             'Company repurchases its own shares from the market, reducing outstanding shares.',
  merger:              'Two companies combine into one; specify the target company and swap ratio.',
  demerger:            'A business unit or subsidiary is spun off into a separate listed entity.',
  open_offer:          'Acquirer makes an open offer to public shareholders to buy shares at a fixed price.',
  corporate_action_acquisition: 'The tracked company acquires a stake in or takes over another company. Capture the target, stake percentages, deal size, and price details.',

  // disclosure
  bulk_deal:           'A single transaction of >=0.5% of total shares in a trading day, disclosed by exchange.',
  block_deal:          'A large negotiated transaction done through a separate block deal window.',
  fii_buy:             'Foreign Institutional Investor reports a significant increase in shareholding.',
  fii_sell:            'Foreign Institutional Investor reports a significant decrease in shareholding.',
  dii_buy:             'Domestic Institutional Investor reports an increase in shareholding.',
  dii_sell:            'Domestic Institutional Investor reports a decrease in shareholding.',
  superinvestor_buy:   'A well-known or high-profile investor increases their stake in the company.',
  superinvestor_sell:  'A well-known or high-profile investor decreases their stake in the company.',
  shareholding_change: 'General change in the shareholding pattern of a significant stakeholder.',
  mutual_fund_change:  'A mutual fund house discloses a change in its holding during a quarter.',

  // insider
  insider_buy:         'An insider (promoter, director, KMP) purchases shares in the open market.',
  insider_sell:        'An insider (promoter, director, KMP) sells shares in the open market.',
  pledge:              'Promoter or insider pledges their shares as collateral - a risk indicator.',
  pledge_release:      'Previously pledged shares are released, indicating improved financial health.',
  acquisition:         'An insider acquires shares, increasing their stake in the company.',
  creeping_acquisition: 'Gradual acquisition of shares by an insider over time, cumulatively significant.',
  esop_exercise:       'Employee exercises vested stock options, converting them into equity shares.',

  // business
  contract:            'Company wins or signs a new contract with a client or government entity.',
  order_win:           'Company receives a major new order, indicating business momentum.',
  capex:               'Company announces a significant capital expenditure for expansion or modernisation.',
  jv_partnership:      'Company forms a joint venture or strategic partnership with another entity.',
  expansion:           'Company announces geographical or capacity expansion plans.',
  plant_commissioning: 'A new plant or manufacturing unit is commissioned and ready to operate.',
  new_product:         'Company launches or announces a new product or service offering.',
  sales_initiative:    'Company launches a structured sales push, campaign, channel expansion or GTM strategy.',
  divestiture:         "Company divests (sells) a business unit, subsidiary, or asset.",

  // governance
  board_appointment:   'A new member is appointed to the Board of Directors.',
  board_resignation:   'An existing Board member resigns; capture reason and effective date.',
  auditor_appointment: 'A new statutory auditor is appointed.',
  auditor_resignation: 'The statutory auditor resigns before term completion - a significant governance flag.',
  sebi_action:         'SEBI takes a regulatory or enforcement action against the company.',
  regulatory_notice:   'Company receives a show-cause notice or regulatory scrutiny from a regulator.',
  agm:                 'Annual General Meeting - routine shareholder meeting for annual resolutions.',
  egm:                 'Extraordinary General Meeting - called for special resolutions outside the AGM cycle.',

  // credit_rating
  rating_upgrade:      "Credit agency upgrades the company's debt rating - positive credit outlook.",
  rating_downgrade:    "Credit agency downgrades the company's debt rating - deteriorating credit profile.",
  rating_watch:        'Instrument placed on watch for a possible rating change in the near term.',
  rating_reaffirmed:   'Existing rating is reaffirmed without change - stable credit profile.',

  // financials
  quarterly_results:   'Quarterly earnings results (P&L, EBITDA, PAT) released by the company.',
  annual_results:      'Full-year consolidated/standalone financial results.',
  provisional_numbers: 'Preliminary/provisional unaudited numbers released ahead of formal results.',
  guidance_upgrade:    'Management raises its forward revenue or margin guidance.',
  guidance_downgrade:  'Management lowers its forward revenue or margin guidance - a caution signal.',
  guidance_maintained: 'Management reaffirms its previously stated revenue/margin guidance.',
  restatement:         'Company restates previously published financial figures due to error or standard change.',

  // fundraising
  qip:                    'Qualified Institutional Placement - private placement of shares to qualified buyers.',
  fpo:                    'Follow-on Public Offer - additional public issue of shares by a listed company.',
  preferential_allotment: 'Allotment of shares to specific investors at a board-approved price.',
  ncd:                    'Non-Convertible Debenture issuance to raise debt from the market.',
  bond:                   'Bond issuance for raising long-term debt capital.',
  ipo:                    'Initial Public Offering - company lists on a stock exchange for the first time.',
  debt_repayment:         "Company repays outstanding debt, improving its leverage profile.",
  rights_issue_fund:      'Rights issue used as a fundraising mechanism - shareholders offered discounted shares.',
  private_placement:      'Shares or securities privately placed with a select group of investors.',

  // legal
  court_order:  'A court issues an order (favorable or adverse) related to company litigation.',
  arbitration:  'An arbitration forum issues an award or ruling involving the company.',
  tax_demand:   'Tax authority raises a demand on the company - disclose amount and company stance.',
  penalty:      'Regulator or agency imposes a monetary penalty on the company.',
  ibc_filing:   'Insolvency and Bankruptcy Code (IBC) filing initiated by or against the company.',
  notice:       'Company receives a legal notice from a third party or regulator.',
  settlement:   'A legal dispute or arbitration is resolved via a negotiated settlement.',
};
