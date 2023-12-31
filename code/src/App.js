import './App.css';
import { jsPDF } from "jspdf";
import constData from "./consts.json";
import { debit_descriptions } from './fakeDebitTransactions';
import { credit_descriptions } from './fakeCreditTransactions';
import autoTable from 'jspdf-autotable';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import React from 'react';
import ContinuousSlider from './ContinuousSlider';
import { BANK_NAMES } from './bankNames';
import './Please write me a song-normal.js'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { noise } from './noise';
import NoiseSlider from './NoiseSlider';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import stripePng from "./stripe.png";
import gridPng from "./grid.png";
import plainPng from "./plain.png";
import faker from 'faker';
import dayjs from 'dayjs';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import Tooltip from '@mui/material/Tooltip';

const MAX_CHEQUE_VALUE = 5000;
const MAX_CHEQUE_TOTAL = 5000;
const CUSTOM_FONT = "Please write me a song";
const MAX_CHEQUE_COUNT = 20;

const SEED = Date.now();

let totalDebit = 0;
let totalCredit = 0;

function App() {
  const currentDate = new Date(); // Now
  const [openingDate, setOpeningDate] = React.useState(dayjs(currentDate.now));
  currentDate.setDate(currentDate.getDate() + 30);
  const [closingDate, setClosingDate] = React.useState(dayjs(currentDate));
  const [newError, setError] = React.useState(null);
  const [openingBalance, setOpeningBalance] = React.useState(1000);
  const [closingBalance, setClosingBalance] = React.useState(5000);
  const [transactionCount, setTransactionCount] = React.useState(25);
  const [showCustom, setShowCustom] = React.useState(true);
  const [noiseIntensity, setNoiseIntensity] = React.useState(10);
  const [currentTableStyle, setCurrentTableStyle] = React.useState('striped');
  const [noiseEnabled, setNoiseEnabled] = React.useState(true);

  const handleGenerate = () => {
    let bankName = document.getElementById('bank-name').value;
    const numTransactions = transactionCount;
    const cheques_toggle = document.getElementById('cheques-toggle').checked;
    const splitAmount = document.getElementById('deposits-withdrawals-toggle').checked;
    const showBalance = document.getElementById('balance-toggle').checked;
    const tableStyle = document.getElementById('tableStyles').value;
    const tableSplit = document.getElementById('deposits-withdrawals-table-toggle').checked;
    const tableHeaderToggle = document.getElementById('table-header-toggle').checked;
    const customBankName = document.getElementById('custom-bank-name') ? document.getElementById('custom-bank-name').value : "";
    const customFont = document.getElementById('handwriting-toggle').checked;
    const enableNoise = document.getElementById('noise-toggle').checked;

    bankName = customBankName.length > 0 ? customBankName : bankName;
    const summaryToggle = document.getElementById('summary-header-toggle').checked;

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const openingDateStr = monthNames[openingDate.$M] + " " + openingDate.$D.toString() +  ", " + openingDate.$y.toString()
    const closingDateStr = monthNames[closingDate.$M] + " " + closingDate.$D.toString() +  ", " + closingDate.$y.toString()
  
    buildPdf(bankName, cheques_toggle, numTransactions, splitAmount, showBalance, openingDateStr, closingDateStr, tableStyle, parseFloat(openingBalance), parseFloat(closingBalance), tableSplit, tableHeaderToggle, summaryToggle, customFont, enableNoise, noiseIntensity);
  };

  const loadBankNames = () => {
    const optionsObject = [];
    BANK_NAMES.forEach(name => {
      optionsObject.push(<option value={name}>{name}</option>)
    });
    return optionsObject;
  }


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div className="App">
      <header className="App-header sticky" >

        <h1>
        <img src='bsc-logo.png'></img>
          Bank Statement Creator
        </h1>
      </header>
      <Container className="main-form-container">
        <Row>
          <Col className="bank-name-selector-container">
            <Row><h4>Select Bank Name</h4></Row>
            <Row>
              <select className="bank-name-selector" onChange={() => {
                if (document.getElementById('bank-name').value !== 'OTHER (CUSTOM NAME)') {
                  setShowCustom(false);
                } else {
                  setShowCustom(true);
                }
              }} id='bank-name' name='bank-name'>
                {loadBankNames()}
              </select>
              {showCustom ? 
                <><h4 className="custom-name-header">Input Custom Name</h4>
                <input
                  id="custom-bank-name"
                  type="text"
                  name="custom-bank-name"
                  className="custom-bank-fields"
                /></>
                :
                <></>
              }
            </Row>
          </Col>
        </Row>
        <Row className="statement-summary-options">
          <Col>
              <Row className="balance-row">
                <Col>
                  <h4>Opening Balance</h4>
                  <div id="opening-balance">
                    <TextField
                      required
                      id="outlined-required"
                      label="Required"
                      defaultValue="1000"
                      onChange= {(e) => setOpeningBalance(e.target.value)}
                      className='balance-text-field'
                    />
                  </div>
                </Col>
                <Col>
                  <h4>Closing Balance</h4>
                  <div id="closing-balance">
                    <TextField
                      required
                      id="outlined-required"
                      label="Required"
                      defaultValue="5000"
                      onChange= {(e) => setClosingBalance(e.target.value)}
                      className='balance-text-field'
                    />
                  </div>
                </Col>
              </Row>
              <Row className="balance-row">
                <Col>
                  <h4>Opening Date</h4>
                  <div id="date-picker">
                    <DatePicker label="Required*" id='opening-date' dateFormat='dd,MM,yyyy' value={openingDate} onChange={(newOpeningDate) => setOpeningDate(newOpeningDate)} defaultValue={Date().now}/>
                  </div>
                </Col>
                <Col>
                  <h4>Closing Date</h4>
                  <div id="date-picker">
                    <DatePicker label="Required*" id='closing-date' dateFormat='dd,MM,yyyy' value={closingDate} onChange={(newClosingDate) => setClosingDate(newClosingDate)} />
                  </div>
                </Col>
              </Row>
              <Row className="table-style-row">
                <Col className="table-style-col">
                  <h4>Table Style</h4>
                  <select className="bank-name-selector" name="tableStyles" id="tableStyles" onChange={
                    (e) => {
                      setCurrentTableStyle(document.getElementById('tableStyles').value)
                    }
                  }>
                    <option value="striped">STRIPED</option>
                    <option value="grid">GRID</option>
                    <option value="plain">PLAIN</option>
                  </select>
                </Col>
                <Col>
                  {
                    currentTableStyle === 'plain' ?
                      <img src={plainPng} className="table-style-image"></img> :
                      currentTableStyle === 'grid' ?
                          <img src={gridPng} className="table-style-image"></img> :
                          <img src={stripePng} className="table-style-image"></img>
                  }
                  <p>-- example table --</p>
                </Col>
              </Row>
            </Col>
        </Row>
        <Row className="toggle-container">
          <Row>
            <Col>
              <h5>Include cheque table</h5>
              <Tooltip title="Add cheque table to bottom of statement" placement="left-start" arrow>
                <label className="switch">
                  <input id='cheques-toggle' type="checkbox"></input>
                  <span className="slider round"></span>
                </label>
              </Tooltip>
            </Col>
            <Col>
              <h5>Include balance column</h5>
              <Tooltip title="Add balance column to end of transaction table" placement="left-start" arrow>
                <label className="switch">
                  <input id='balance-toggle' type="checkbox"></input>
                  <span className="slider round"></span>
                </label> 
              </Tooltip>
            </Col>
          </Row>
          <Row>
            <Col>
              <h5>Enable handwriting</h5>
              <Tooltip title="Use handwriting font to mimic handwriting" placement="left-start" arrow>
                <label className="switch">
                  <input id='handwriting-toggle' type="checkbox"></input>
                  <span className="slider round"></span>
                </label>
              </Tooltip>
            </Col>
            <Col>
              <h5>Show table header on all page</h5> 
              <Tooltip title="Show table headers when tables bleed into next page" placement="left-start" arrow>
                <label className="switch">
                  <input id='table-header-toggle' type="checkbox"></input>
                  <span className="slider round"></span>
                </label> 
              </Tooltip> 
            </Col>
          </Row>
          <Row>
            <Col>
              <h5>Split debit/credit <strong><em>columns</em></strong></h5>
              <Tooltip title="Split debit and credit amounts into their own columns in transaction table" placement="left-start" arrow>
                <label className="switch">
                  <input onChange={() => {
                    const column_split_toggle = document.getElementById('deposits-withdrawals-toggle').checked;
                    if (column_split_toggle) {
                      document.getElementById('deposits-withdrawals-table-toggle').checked = false
                    }
                  }} id='deposits-withdrawals-toggle' type="checkbox"></input>
                  <span className="slider round"></span>
                </label>  
              </Tooltip>
            </Col>
            <Col>
              <h5>Split debit/credit into separate <strong><em>tables</em></strong></h5>
              <Tooltip title="Split debit and credit amounts into separate transaction tables" placement="left-start" arrow>
                <label className="switch">
                  <input onChange={() => {
                    const table_split_toggle = document.getElementById('deposits-withdrawals-table-toggle').checked;
                    if (table_split_toggle) {
                      document.getElementById('deposits-withdrawals-toggle').checked = false
                    }
                  }} id='deposits-withdrawals-table-toggle' type="checkbox"></input>
                  <span className="slider round"></span>
                </label>
              </Tooltip>
            </Col>
          </Row>
          <Row>
            <Col>
              <h5>Consolidate summary table into single row</h5>
              <Tooltip title="Display summary table as a single row table" placement="left-start" arrow>
                <label className="switch">
                  <input id='summary-header-toggle' type="checkbox"></input>
                  <span className="slider round"></span>
                </label>
              </Tooltip>
            </Col>
            <Col><></></Col>
          </Row>
        </Row>
      </Container>
      <Container className="slider-box">
        <Row>
          <Col xs={2}>
              <Row><h4>Enable Noise</h4></Row>
              <Row>
                <Col>
                  <Tooltip title="Add noise distortion on entire PDF to mimic low quality scan. (Noise Intensity 1-3 reccommended)" placement="bottom" arrow>
                  <label className="switch">
                    <input id='noise-toggle' type="checkbox" onChange={() => {
                      setNoiseEnabled(!document.getElementById('noise-toggle').checked);
                    }}></input>
                    <span className="slider-spicy round"></span>
                  </label>
                  </Tooltip>
                </Col>
              </Row>
          </Col>
          <Col xs={10}>
            <NoiseSlider disabled={noiseEnabled} className="transaction-slider" setNoiseIntensity={setNoiseIntensity}></NoiseSlider>
          </Col>
        </Row>
        <Row>
          <Col xs={2}></Col>
          <Col xs={10}><ContinuousSlider className="transaction-slider" setTransactionCount={setTransactionCount}/></Col>
        </Row>
      </Container>
      <Container>
        <Button className="generate-button" onClick={(e) => {
                e.preventDefault();
                try {
                  if (!openingBalance || !closingBalance) {
                    sendToast('Opening/Closing balance is required', true);
                  } else {
                    handleGenerate(transactionCount);
                    sendToast('PDF Successfully Generated!');
                  }
                } catch (err) {
                  if (!openingDate || !closingDate) {
                    sendToast('Opening/Closing date is required', true);
                  } else {
                    sendToast(err, true);
                  }
                }
              }
            }>generate!</Button>
      </Container>
      <form>
      </form>
    </div>
    </LocalizationProvider>
  );
}

// A4 PAPER 210mm X 297mm
const buildPdf = (bankName, cheques_toggle, transactionCount, splitAmount = false, showBalance = false, openingDateStr, closingDateStr, tableStyle='striped', openingBalance, closingBalance, tableSplit, tableHeaderToggle, summaryToggle, customFont, enableNoise, noiseIntensity) => {
  totalDebit = 0;
  totalCredit = 0;

  let doc = new jsPDF();
  doc.setFont(customFont ? CUSTOM_FONT : 'helvetica');
  // doc.setFontType('normal');
  doc.setFontSize(9);
  const startDate = new Date(openingDateStr);
  const endDate = new Date(closingDateStr);
  // const openingBalance = 0;
  // const closingBalance = 2000;

  // doc.text(bankName, 10, 15);

  let buildSummaryTableFunc;
  let buildTransactionTableFunc;
  let buildChequeTableFunc;

  const autotableColorDict = {
    'TD': [53, 178, 52], 'BMO': [0, 121, 193], "Scotiabank":[255,0,0] , "RBC": [255, 210, 0],
    "Citibank": [0, 93, 224], "ATB": [0, 117, 234], "Paypal": [255, 205, 47], "Tangerine": [239, 108, 47],
    "Manulife Bank": [0, 192, 111], "Comerica": [42, 71, 122], "Fifth Third Bank": [2, 65, 144],
    "Capital One": [0, 20, 42], "U.S. Bank": [0, 35, 113], "Desjardins": [0, 136, 83], "RBS": [61, 15, 81],
    "Home Depot": [252, 126, 50], "Capitec": [0, 76, 122], "Regions": [110, 199, 69], "Chase": [0, 86, 166],
    "HSBC": [223, 0, 22], "Bank of America": [232, 0, 56], "Wells Fargo": [219, 5, 42], "CIBC": [180, 0, 30],
    "OTHER (CUSTOM NAME)": [34, 62, 26], "AMEX": [47, 109, 201]
  }

  const colorBankName = BANK_NAMES.includes(bankName) ? bankName : 'OTHER (CUSTOM NAME)';

  const autotableColor = autotableColorDict[colorBankName];

  var imgData = constData.imageEncodings[colorBankName];
  doc.addImage(imgData, 'JPEG', 15, 17, 15, 15);

  // adding bank name and address 
  doc.text(bankName, 35, 20);
  doc.text(`P.O. Box ${faker.address.streetAddress()}`, 35, 25);
  doc.text(`${faker.address.state()}, ${faker.address.country()}, ${faker.address.zipCode()}`, 35, 30);
  doc.text( "From " + openingDateStr + " to " + closingDateStr, 192, 20, {align: 'right'});

  doc.setFontSize(12);
  // adding  personal address and account summary
  doc.text(`${faker.name.firstName()} ${faker.name.lastName()}`, 15, 47);
  doc.text(faker.address.streetAddress(), 15, 54);
  doc.text(`${faker.address.city()}, ${faker.address.country()}, ${faker.address.zipCode()}`, 15, 61);

  doc.setFontSize(9);
  doc.text("Your account number: ", 130, 47);
  doc.text("123456789 ", 175, 47);
  doc.text("___________________________________ ", 130, 50);
  doc.text("How to reach us: ", 130, 54);
  doc.text("1-800-bank ", 175, 54);
  doc.text('www.'+ bankName +".com", 192, 58, {align: 'right'});
  doc.text("___________________________________ ", 130, 60);

  // if (!summaryToggle) {
  //   buildSummaryTable(doc, bankName, openingDateStr, closingDateStr, openingBalance, closingBalance, autotableColor, customFont);
  // } else {
  //   buildSingleRowSummaryTable(doc, bankName, openingDateStr, closingDateStr, openingBalance, closingBalance, autotableColor, customFont);
  // }

  // if (enableNoise) {
  //   const noiseOverlay = noise;
  //   let noiseApplied = 0;
  //   while (noiseApplied < noiseIntensity/10) {
  //     doc.addImage(noiseOverlay, 'PNG', 0, 0, doc.maxWidth, doc.height);
  //     noiseApplied++;
  //   }
  // }

  // doc.setLineWidth(0.5);
  // doc.rect(127, 65, 65, 25);

  // doc.text('Dear customer, we are pleased to introduce to you paperless banking. We are excited for you to join us on this journey. Now you can retrieve images of cheques in seconds and view them online of on our app. ', 130, 70, { maxWidth: 60 });

  doc = buildTransactionTable(doc, transactionCount, cheques_toggle, startDate, endDate, openingBalance, closingBalance, splitAmount, showBalance, autotableColor, tableStyle, tableSplit, tableHeaderToggle, customFont, enableNoise, noiseIntensity, summaryToggle, bankName, openingDateStr, closingDateStr);

  if (cheques_toggle) {
    doc = buildChequeTable(doc, Math.floor(Math.random(SEED) * MAX_CHEQUE_COUNT), startDate, endDate, 3, autotableColor, tableStyle, tableHeaderToggle, customFont);
  }

  if (enableNoise) {
    const noiseOverlay = noise;
    let noiseApplied = 0;
    while (noiseApplied < noiseIntensity/10) {
      doc.addImage(noiseOverlay, 'PNG', 0, 0, doc.maxWidth, doc.height);
      noiseApplied++;
    }
  }

  doc.save('test.pdf');
}

const buildSummaryTable = (doc, bankName, openingDate, closingDate, openingBalance=0, closingBalance=0, autotableColor, customFont) => {
  doc.text("___________________________________ ", 15, 75);
  // doc.text('')

  const header = [];
  header.push('Summary of Account');
  header.push(" ")
  const body = [];
  // const totalAccountDiff = Math.abs(closingBalance - openingBalance) / 2
  const roundTotalDebit = (100 * (Math.abs(totalDebit) + Number.EPSILON)) / 100;
  const roundTotalCredit = (100 * (Math.abs(totalCredit) + Number.EPSILON)) / 100;

  // body.push([bankName, ""]);
  body.push(['Your opening balance on ' + openingDate, "$" +openingBalance.toString()] )

  body.push(['Total deposits into your account ' , "+" + Math.abs(totalCredit).toFixed(2).toString()] )
  body.push(['Total withdrawals from your account ' ,  "-" + Math.abs(totalDebit).toFixed(2).toString()])

  body.push(['Your closing balance on ' + closingDate, "= $"+closingBalance.toString() ])

  autoTable(doc, {
    startY: 65,
    head: [header],
    body: body,
    tableWidth: 95,
    columnStyles: {
      0: {
        halign: 'left'
      },
      1: {
          halign: 'right'
      },
    },
    headStyles :{fillColor : autotableColor},
    styles: { font: customFont ? CUSTOM_FONT : 'helvetica' },
    // theme: 'grid'
  });

}
const buildSingleRowSummaryTable = (doc, bankName, openingDateStr, closingDateStr, openingBalance=0, closingBalance=0, autotableColor, customFont) => { 

  const header = [];
  header.push('Opening Balance');
  header.push('Deposits')
  header.push("Withdrawals")
  header.push("Closing Balance")
  const body = [];
  // const totalAccountDiff = Math.trunc(Math.abs(closingBalance - openingBalance) / 2)
  const roundTotalDebit = (100 * (Math.abs(totalDebit) + Number.EPSILON)) / 100;
  const roundTotalCredit = (100 * (Math.abs(totalCredit) + Number.EPSILON)) / 100;

  const openingBalanceStr = openingBalance.toString();
  body.push(openingBalanceStr)

  // const depositsStr = totalAccountDiff.toString() 
  body.push(Math.abs(totalCredit).toFixed(2).toString())

  // const withdrawlsStr =totalAccountDiff.toString();
  body.push(Math.abs(totalDebit).toFixed(2).toString())

  const closingBalanceStr = closingBalance.toString();
  body.push(closingBalanceStr )

  autoTable(doc, {
    startY: 75,
    head: [header],
    body: [body],
    tableWidth: 95,
    columnStyles: {
      0: {
        halign: 'center'
      },
      1: {
          halign: 'center'
      },
      2: {
        halign: 'center'
      },
      3: {
        halign: 'center'
      }
    },
    headStyles :{fillColor : autotableColor},
    styles: { font: customFont ? CUSTOM_FONT : 'helvetica' },
  });
  
}
const buildTransactionTable = (doc, transactionCount, cheques_toggle, startDate, endDate, openingBalance, closingBalance, splitAmount = false, showBalance = false, autotableColor, tableStyle, tableSplit, tableHeaderToggle, customFont, enableNoise, noiseIntensity, summaryToggle, bankName, openingDateStr, closingDateStr) => {

  const balanceDifference = (closingBalance - (cheques_toggle ? MAX_CHEQUE_TOTAL : 0)) - openingBalance;

  totalCredit += (cheques_toggle ? MAX_CHEQUE_TOTAL : 0);

  let transactionsGenerated = 0;
  let transactionRows = [];
  let debitTransactionRows = [];
  let creditTransactionRows = [];
  let accumulatedBalanceDifference = 0;
  // fix weird month offset
  startDate.setMonth(startDate.getMonth() + 1);
  endDate.setMonth(endDate.getMonth() + 1);
  let currentDay = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) - transactionCount;

  while (transactionsGenerated < transactionCount) {
    let currentTransactionAmount = (Math.round(Math.random(SEED)) * 2 - 1) * (Math.round(100 * (Math.random(SEED) * balanceDifference + Number.EPSILON)) / 100);

    if (transactionsGenerated === transactionCount - 1 && accumulatedBalanceDifference !== balanceDifference) {
      currentTransactionAmount = Math.round(100 * (balanceDifference - accumulatedBalanceDifference  + Number.EPSILON)) / 100;
    }

    accumulatedBalanceDifference += currentTransactionAmount;

    if (currentTransactionAmount >= 0) {
      totalDebit += currentTransactionAmount;
    } else {
      totalCredit += currentTransactionAmount;
    }

    const currLineDate = startDate.addDays(currentDay > 0 ? currentDay : 0);
    const descriptionObject = currentTransactionAmount < 0 ? debit_descriptions : credit_descriptions;

    let currentTransactionRow = [];

    if (splitAmount && currentTransactionAmount < 0) {
      currentTransactionRow = [`${currLineDate.getMonth()}/${currLineDate.getDate()}`, `${currLineDate.getMonth()}/${currLineDate.getDate()}`, descriptionObject[Math.floor(Math.random(SEED) * descriptionObject.length)], currentTransactionAmount.toFixed(2) , ""];
    } else if (splitAmount) {
      currentTransactionRow = [`${currLineDate.getMonth()}/${currLineDate.getDate()}`, `${currLineDate.getMonth()}/${currLineDate.getDate()}`, descriptionObject[Math.floor(Math.random(SEED) * descriptionObject.length)], "" , currentTransactionAmount.toFixed(2)];
    } else {
      currentTransactionRow = [`${currLineDate.getMonth()}/${currLineDate.getDate()}`, `${currLineDate.getMonth()}/${currLineDate.getDate()}`, descriptionObject[Math.floor(Math.random(SEED) * descriptionObject.length)], currentTransactionAmount.toFixed(2)];
    }

    if (showBalance) {
      currentTransactionRow.push((Math.round(100 * (openingBalance + accumulatedBalanceDifference + Number.EPSILON)) / 100).toFixed(2));
    }

    if (tableSplit && currentTransactionAmount < 0) {
      debitTransactionRows.push(currentTransactionRow);
    } else if (tableSplit) {
      creditTransactionRows.push(currentTransactionRow);
    } else {
      transactionRows.push(currentTransactionRow);
    }
    
    currentDay++;
    transactionsGenerated++;
  }

  if (!summaryToggle) {
    buildSummaryTable(doc, bankName, openingDateStr, closingDateStr, openingBalance, closingBalance, autotableColor, customFont);
  } else {
    buildSingleRowSummaryTable(doc, bankName, openingDateStr, closingDateStr, openingBalance, closingBalance, autotableColor, customFont);
  }

  if (enableNoise) {
    const noiseOverlay = noise;
    let noiseApplied = 0;
    while (noiseApplied < noiseIntensity/10) {
      doc.addImage(noiseOverlay, 'PNG', 0, 0, doc.maxWidth, doc.height);
      noiseApplied++;
    }
  }

  doc.setLineWidth(0.5);
  doc.rect(127, 65, 65, 25);

  doc.text('Dear customer, we are pleased to introduce to you paperless banking. We are excited for you to join us on this journey. Now you can retrieve images of cheques in seconds and view them online of on our app. ', 130, 70, { maxWidth: 60 });

  const headerRow = ['TRAN DATE', 'POST DATE', 'DESCRIPTION'];

  if (tableSplit) {
    headerRow.push('AMOUNT');

    if (showBalance) {
      headerRow.push('BALANCE');
    }

    const previousTableY = doc.autoTable.previous.finalY;
    
    autoTable(doc, {
      theme: tableStyle,
      head: [headerRow],
      body: creditTransactionRows,
      headStyles :{fillColor : autotableColor},
      startY: 120,
      showHeader: tableHeaderToggle ? 'everyPage' : 'firstPage',
      styles: { font: customFont ? CUSTOM_FONT : 'helvetica' },
      didDrawPage: function(data) {
        if (enableNoise) {
          const noiseOverlay = noise;
          let noiseApplied = 0;
          while (noiseApplied < noiseIntensity/10) {
            doc.addImage(noiseOverlay, 'PNG', 0, 0, doc.maxWidth, doc.height);
            noiseApplied++;
          }
        }
      }
    });

    autoTable(doc, {
      theme: tableStyle,
      head: [headerRow],
      body: debitTransactionRows,
      headStyles :{fillColor : autotableColor},
      showHeader: tableHeaderToggle ? 'everyPage' : 'firstPage',
      styles: { font: customFont ? CUSTOM_FONT : 'helvetica' },
      didDrawPage: function(data) {
        if (enableNoise) {
          const noiseOverlay = noise;
          let noiseApplied = 0;
          while (noiseApplied < noiseIntensity/10) {
            doc.addImage(noiseOverlay, 'PNG', 0, 0, doc.maxWidth, doc.height);
            noiseApplied++;
          }
        }
      }
    });
  } else {
    if (splitAmount) {
      headerRow.push('DEBIT');
      headerRow.push('CREDIT');
    } else {
      headerRow.push('AMOUNT');
    }
  
    if (showBalance) {
      headerRow.push('BALANCE');
    }
  
    autoTable(doc, {
      theme: tableStyle,
      head: [headerRow],
      body: transactionRows,
      startY: 120,
      showHeader: tableHeaderToggle ? 'everyPage' : 'firstPage',
      styles: { font: customFont ? CUSTOM_FONT : 'helvetica' },
      headStyles :{fillColor : autotableColor},
      didDrawPage: function(data) {
        if (enableNoise) {
          const noiseOverlay = noise;
          let noiseApplied = 0;
          while (noiseApplied < noiseIntensity/10) {
            doc.addImage(noiseOverlay, 'PNG', 0, 0, doc.maxWidth, doc.height);
            noiseApplied++;
          }
        }
      }
    });
  }

  return doc;
}

const buildChequeTable = (doc, chequeCount, startDate, endDate, numColumns, autotableColor, tableStyle='striped', tableHeaderToggle, customFont, enableNoise, noiseIntensity) => {
  const headerRow = ['CHECK #', 'DATE', 'AMOUNT'];
  const chequeRows = [];
  let currentDay = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) - chequeCount;
  const allocatedChequeTotal = MAX_CHEQUE_TOTAL;

  let numChequeTables = 1;
  while (numChequeTables < numColumns) {
    headerRow.push('CHECK #');
    headerRow.push('DATE');
    headerRow.push('AMOUNT');
    numChequeTables++;
  }

  let numChequesAdded = 0;
  let accumulatedChequeValue = 0;
  while (numChequesAdded < chequeCount) {
    const singleChequeRow = [];
    for (let i = 0; i < numColumns; i++) {
      const checkNum = `${Math.floor(Math.random(SEED) * 1000000)}`;
      const checkDate = startDate.addDays(currentDay > 0 ? currentDay : 0);
      let checkAmount = (Math.round(100 * (Math.random(SEED) * MAX_CHEQUE_VALUE + Number.EPSILON)) / 100);
      if (accumulatedChequeValue < allocatedChequeTotal && numChequesAdded === chequeCount - 1) {
        checkAmount = (allocatedChequeTotal - accumulatedChequeValue);
      }
      if (allocatedChequeTotal - accumulatedChequeValue - checkAmount < 0)  {
        checkAmount = Math.floor((allocatedChequeTotal - accumulatedChequeValue) / 2);
      }
      accumulatedChequeValue += checkAmount

      if (numChequesAdded < chequeCount) {
        singleChequeRow.push(checkNum);
        singleChequeRow.push(`${checkDate.getMonth()}/${checkDate.getDate()}`);
        singleChequeRow.push(checkAmount.toFixed(2));
        numChequesAdded++;
      }
      currentDay++;
    }
    chequeRows.push(singleChequeRow);
  }

  autoTable(doc, {
    theme: tableStyle,
    head: [headerRow],
    body: chequeRows,
    showHeader: tableHeaderToggle ? 'everyPage' : 'firstPage',
    headStyles: {fillColor: autotableColor},
    styles: { font: customFont ? CUSTOM_FONT : 'helvetica' },
    didDrawPage: function (data) {
      if (enableNoise) {
        const noiseOverlay = noise;
        let noiseApplied = 0;
        while (noiseApplied < noiseIntensity/10) {
          doc.addImage(noiseOverlay, 'PNG', 0, 0, doc.maxWidth, doc.height);
          noiseApplied++;
        }
      }
    }
  });

  return doc;
}

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

const sendToast = (message, fail=false) => {
  Toastify({
    text: message,
    duration: 5000,
    close: true,
    gravity: "bottom", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: fail ? "#eb4c34" : "#5beb34",
      width: "100%",
      color: "white",
      borderRadius: "10px",
      fontWeight: "bolder",
      fontSize: "1.5rem"
    },
    onClick: function(){} // Callback after click
  }).showToast();
}

export default App;
