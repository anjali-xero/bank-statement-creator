import './App.css';
import { jsPDF } from "jspdf";
import constData from "./consts.json";

function App() {
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

        <label>Transaction Count:</label>
        <select id='transCount' name='transCount'>
          <option value=''></option>
          <option value='5'>5</option>
          <option value='25'>25</option>
          <option value='50'>50</option>
        </select>
        <button 
          onClick={(e) => {
              e.preventDefault();
              handleGenerate();
            }
          }
          type="button"
        >generate!</button>
      </form>
     
    </div>
  );
}

const handleGenerate = () => {
  console.log('generated!');
  const bankName = document.getElementById('bank-name').value;
  const numTransactions = document.getElementById('transCount');
  const cheques_toggle = document.getElementById('cheques-toggle').checked;

  buildPdf(bankName, cheques_toggle, numTransactions);
};

// A4 PAPER 210mm X 297mm
const buildPdf = (bankName, cheques_toggle, transactionCount) => {
  const doc = new jsPDF();

  doc.text(bankName, 10, 15);

  let transactionsGenerated = 0;
  while (transactionsGenerated)

  if (cheques_toggle) {
    doc.text('cheques', 2, 15)
  }

  var imgData = constData.imageEncodings[bankName];
  doc.addImage(imgData, 'JPEG', 15, 20, 15, 15);
  doc.save('test.pdf');
}

export default App;
