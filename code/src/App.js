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

const MAX_CHEQUE_VALUE = 10000;
const TABLE_HEADER_MARGIN = 2; //px

const SEED = Date.now();

function App() {
  const [openingDate, setOpeningDate] = React.useState(null);
  const [closingDate, setClosingDate] = React.useState(null);
  const [transactionCount, setTransactionCount] = React.useState(25);

  const handleGenerate = () => {
    console.log('generated!');
    const bankName = document.getElementById('bank-name').value;
    const numTransactions = transactionCount;
    const cheques_toggle = document.getElementById('cheques-toggle').checked;
    const splitAmount = document.getElementById('deposits-withdrawals-toggle').checked;
    const showBalance = document.getElementById('balance-toggle').checked;
    const tableStyle = document.getElementById('tableStyles').value;
    const tableSplit = document.getElementById('deposits-withdrawals-table-toggle').checked;
    const tableHeaderToggle = document.getElementById('table-header-toggle').checked;

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const openingDateStr = monthNames[openingDate.$M] + " " + openingDate.$D.toString() +  ", " + openingDate.$y.toString()
    const closingDateStr = monthNames[closingDate.$M] + " " + closingDate.$D.toString() +  ", " + closingDate.$y.toString()
    console.log(openingDateStr)
  
    buildPdf(bankName, cheques_toggle, numTransactions, splitAmount, showBalance, openingDateStr, closingDateStr, tableStyle, tableSplit, tableHeaderToggle);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div className="App">
      <header className="App-header">
        <h1>
          Welcome to bank statement creator
        </h1>
      </header>
      <form>
        <label> Select Bank Name:</label>
        <select id='bank-name' name='bank-name'>
          <option value='RBC'>RBC</option>
          <option value='TD'>TD</option>
          <option value='Scotiabank'>Scotiabank</option>
          <option value='BMO'>BMO</option>
        </select>

        <label> Insert Opening balance for bank statement:</label>
        <input
            id="opening-balance"
            type="text"
            name="opening-balance"
          />
        <label> Insert Closing balance for bank statement:</label>
        <input
            id="closing-balance"
            type="text"
            name="closing-balance"
          />

        <label> Insert Opening Date for bank statement:</label>
        <div id="date-picker">
          <DatePicker  id='opening-date' dateFormat='dd,MM,yyyy' value={openingDate} onChange={(newOpeningDate) => setOpeningDate(newOpeningDate)} />
          
        </div>
        <label> Insert Closing Date for bank statement:</label>
        <div id="date-picker">
          <DatePicker  id='closing-date' dateFormat='dd,MM,yyyy' value={closingDate} onChange={(newClosingDate) => setClosingDate(newClosingDate)} />
        </div>

        <label for="tableStyle">Table Style:</label>
        <select name="tableStyles" id="tableStyles">
          <option value="striped">STRIPED</option>
          <option value="grid">GRID</option>
          <option value="plain">PLAIN</option>
        </select>

        <label> Switch toggle on to include cheques in bank statement: </label>
        <label className="switch">
          <input id='cheques-toggle' type="checkbox"></input>
          <span className="slider round"></span>
        </label>

        <label> Switch toggle on to include balance column in bank statement: </label>
        <label className="switch">
          <input id='balance-toggle' type="checkbox"></input>
          <span className="slider round"></span>
        </label>

        <label> Switch toggle on to show table header on every page: </label>
        <label className="switch">
          <input id='table-header-toggle' type="checkbox"></input>
          <span className="slider round"></span>
        </label>

        <label> Switch toggle on to split withdrawals and deposits into seperate <strong>columns</strong> in bank statement: </label>
        <label className="switch">
          <input onChange={() => {
            const column_split_toggle = document.getElementById('deposits-withdrawals-toggle').checked;
            if (column_split_toggle) {
              document.getElementById('deposits-withdrawals-table-toggle').checked = false
            }
          }} id='deposits-withdrawals-toggle' type="checkbox"></input>
          <span className="slider round"></span>
        </label>

        <label> Switch toggle on to split withdrawals and deposits into seperate <strong>tables</strong> in bank statement: </label>
        <label className="switch">
          <input onChange={() => {
            const table_split_toggle = document.getElementById('deposits-withdrawals-table-toggle').checked;
            if (table_split_toggle) {
              document.getElementById('deposits-withdrawals-toggle').checked = false
            }
          }} id='deposits-withdrawals-table-toggle' type="checkbox"></input>
          <span className="slider round"></span>
        </label>

        <ContinuousSlider className="transaction-slider" setTransactionCount={setTransactionCount}/>

        <button 
          onClick={(e) => {
              e.preventDefault();
              handleGenerate(transactionCount);
            }
          }
          type="button"
        >generate!</button>
      </form>
     
    </div>
    </LocalizationProvider>
  );
}

// A4 PAPER 210mm X 297mm
const buildPdf = (bankName, cheques_toggle, transactionCount, splitAmount = false, showBalance = false, openingDateStr, closingDateStr, tableStyle='striped', tableSplit, tableHeaderToggle) => {
  let doc = new jsPDF();
  doc.setFont("helvetica");
  doc.setFontSize(9);
  const startDate = new Date('March 1 2023');
  const endDate = new Date('April 1 2023');
  const openingBalance = 0;
  const closingBalance = 2000;

  // doc.text(bankName, 10, 15);

  const autotableColorDict = {'TD': [53, 178, 52], 'BMO': [0, 121, 193], "Scotiabank":[255,0,0] , "RBC": [255, 210, 0]}

  const autotableColor = autotableColorDict[bankName];

  var imgData = constData.imageEncodings[bankName];
  doc.addImage(imgData, 'JPEG', 15, 17, 15, 15);

  // adding bank name and address 
  doc.text(bankName, 35, 20);
  doc.text('P.O. Box 1343 Terminal A', 35, 25);
  doc.text('Toronto, Ontario, M1G EY7', 35, 30);
  doc.text( "From " + openingDateStr + " to " + closingDateStr, 130, 20);

  doc.setFontSize(12);
  // adding  personal address and account summary
  doc.text("Susan Sample", 15, 47);
  doc.text('1234 Random Street, Unit 1', 15, 54);
  doc.text('Toronto, Ontario, M1G P9H', 15, 61);

  doc.setFontSize(9);
  doc.text("Your account number: ", 130, 47);
  doc.text("123456789 ", 175, 47);
  doc.text("___________________________________ ", 130, 50);
  doc.text("How to reach us: ", 130, 54);
  doc.text("1-800-bank ", 175, 54);
  doc.text('www.'+ bankName +".com", 192, 58, {align: 'right'});

  doc.setLineWidth(0.5);
  doc.rect(127, 65, 65, 25);

  doc.text('Dear customer, we are pleased to introduce to you paperless banking. We are excited for you to join us on this journey. Now you can retrieve images of cheques in seconds and view them online of on our app. ', 130, 70, { maxWidth: 60 });

  doc = buildTransactionTable(doc, transactionCount, startDate, endDate, openingBalance, closingBalance, splitAmount, showBalance, autotableColor, tableStyle, tableSplit, tableHeaderToggle);

  if (cheques_toggle) {
    doc = buildChequeTable(doc, 10, startDate, endDate, 3, autotableColor, tableStyle, tableHeaderToggle);
  }

  doc.save('test.pdf');
}

const buildTransactionTable = (doc, transactionCount, startDate, endDate, openingBalance, closingBalance, splitAmount = false, showBalance = false, autotableColor, tableStyle, tableSplit, tableHeaderToggle) => {

  const balanceDifference = closingBalance - openingBalance;

  let transactionsGenerated = 0;
  let transactionRows = [];
  let debitTransactionRows = [];
  let creditTransactionRows = [];
  let accumulatedBalanceDifference = 0;
  let currentDay = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) - transactionCount;

  while (transactionsGenerated < transactionCount) {
    let currentTransactionAmount = (Math.round(Math.random(SEED)) * 2 - 1) * (Math.round(100 * (Math.random(SEED) * balanceDifference + Number.EPSILON)) / 100);

    if (transactionsGenerated === transactionCount - 1 && accumulatedBalanceDifference !== balanceDifference) {
      currentTransactionAmount = Math.round(100 * (balanceDifference - accumulatedBalanceDifference  + Number.EPSILON)) / 100;
    }

    accumulatedBalanceDifference += currentTransactionAmount;

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
      startY: 100,
      headStyles :{fillColor : autotableColor},
      showHeader: tableHeaderToggle ? 'everyPage' : 'firstPage',
      addPageContent: function(data) {
        console.log(doc.autoTable.previous.finalY);
        const previousY = doc.autoTable.previous.finalY;
        const approxTableHeight = (data.table.body.length + 1) * data.table.body[0].height;
        const titleY = previousY ? previousY + TABLE_HEADER_MARGIN*2 : data.cursor.y - approxTableHeight - TABLE_HEADER_MARGIN;
        doc.text("CREDIT TRANSACTIONS", 15, titleY);
      }
    });

    autoTable(doc, {
      theme: tableStyle,
      head: [headerRow],
      body: debitTransactionRows,
      headStyles :{fillColor : autotableColor},
      showHeader: tableHeaderToggle ? 'everyPage' : 'firstPage',
      addPageContent: function(data) {
        console.log(doc.autoTable.previous.finalY);
        const previousY = doc.autoTable.previous.finalY;
        const approxTableHeight = (data.table.body.length + 1) * data.table.body[0].height;
        const titleY = previousY ? previousY + TABLE_HEADER_MARGIN*2 : data.cursor.y - approxTableHeight - TABLE_HEADER_MARGIN;
        doc.text("DEBIT TRANSACTIONS", 15, titleY);
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
      startY: 100,
      showHeader: tableHeaderToggle ? 'everyPage' : 'firstPage',
      headStyles :{fillColor : autotableColor}
    });
  }

  return doc;
}

const buildChequeTable = (doc, chequeCount, startDate, endDate, numColumns, autotableColor, tableStyle='striped', tableHeaderToggle) => {
  const headerRow = ['CHECK #', 'DATE', 'AMOUNT'];
  const chequeRows = [];
  let currentDay = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) - chequeCount;

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
      let checkAmount = (Math.round(Math.random(SEED)) * 2 - 1) * (Math.round(100 * (Math.random(SEED) * MAX_CHEQUE_VALUE + Number.EPSILON)) / 100);
      if (accumulatedChequeValue !== 0 && numChequesAdded === chequeCount - 1) {
        checkAmount = (-1 * accumulatedChequeValue);
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
    headStyles: {fillColor: autotableColor}
  });

  return doc;
}

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

export default App;
