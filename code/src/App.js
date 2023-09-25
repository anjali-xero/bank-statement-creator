import './App.css';
import { jsPDF } from "jspdf";
import constData from "./consts.json";
import { debit_descriptions } from './fakeDebitTransactions';
import { credit_descriptions } from './fakeCreditTransactions';
import autoTable from 'jspdf-autotable';
import ContinuousSlider from './ContinuousSlider';
import React from 'react';

const MAX_CHEQUE_VALUE = 10000;

const SEED = Date.now();

function App() {

  const [transactionCount, setTransactionCount] = React.useState(25);

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          Welcome to bank statement creator.
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
        <label> Insert Opening Date for bank statement:</label>
        <input
            id="opening-date"
            type="text"
            name="opening-date"
          />
        <label> Insert Closing Date for bank statement:</label>
        <input
            id="closing-date"
            type="text"
            name="closing-date"
          />

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

        <label> Switch toggle on to split withdrawals and deposits into seperate columns in bank statement: </label>
        <label className="switch">
          <input id='deposits-withdrawals-toggle' type="checkbox"></input>
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
  );
}

const handleGenerate = (transactionCount) => {
  console.log('generated!');
  const bankName = document.getElementById('bank-name').value;
  const numTransactions = transactionCount;
  const cheques_toggle = document.getElementById('cheques-toggle').checked;
  const splitAmount = document.getElementById('deposits-withdrawals-toggle').checked;
  const showBalance = document.getElementById('balance-toggle').checked;

  buildPdf(bankName, cheques_toggle, numTransactions, splitAmount, showBalance);
};

// A4 PAPER 210mm X 297mm
const buildPdf = (bankName, cheques_toggle, transactionCount, splitAmount = false, showBalance = false) => {
  let doc = new jsPDF();
  const startDate = new Date('March 1 2023');
  const endDate = new Date('April 1 2023');
  const openingBalance = 0;
  const closingBalance = 2000;

  doc.text(bankName, 10, 15);

  doc = buildTransactionTable(doc, transactionCount, startDate, endDate, openingBalance, closingBalance, splitAmount, showBalance);

  if (cheques_toggle) {
    doc.text('cheques', 2, 15);
    doc = buildChequeTable(doc, 10, startDate, endDate, 3);
  }

  var imgData = constData.imageEncodings[bankName];
  doc.addImage(imgData, 'JPEG', 15, 20, 15, 15);
  doc.save('test.pdf');
}

const buildTransactionTable = (doc, transactionCount, startDate, endDate, openingBalance, closingBalance, splitAmount = false, showBalance = false) => {

  const balanceDifference = closingBalance - openingBalance;

  let transactionsGenerated = 0;
  let transactionRows = [];
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

    transactionRows.push(currentTransactionRow);
    
    currentDay++;
    transactionsGenerated++;
  }

  const headerRow = ['TRAN DATE', 'POST DATE', 'DESCRIPTION'];

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
    head: [headerRow],
    body: transactionRows
  });

  return doc;
}

const buildChequeTable = (doc, chequeCount, startDate, endDate, numColumns) => {
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
    head: [headerRow],
    body: chequeRows
  });

  return doc;
}

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

export default App;
