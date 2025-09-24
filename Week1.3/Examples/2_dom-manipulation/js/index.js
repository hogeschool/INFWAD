
  function sumComponent() {
    
    const input1 = document.createElement('input');
    input1.type = 'number';
    input1.id = 'num1';
    input1.placeholder = 'Enter first number';

    const input2 = document.createElement('input');
    input2.type = 'number';
    input2.id = 'num2';
    input2.placeholder = 'Enter second number';

    const operator = document.createTextNode(" + ");
    const isSign = document.createTextNode(" = ");


    const button = document.createElement('button');
    button.textContent = 'Calculate Sum';
    
    const result = document.createElement("span", null, "not defined")
    result.id = 'result';

    button.onclick = () => {
      const number1 = parseFloat(document.getElementById('num1').value);
      const number2 = parseFloat(document.getElementById('num2').value);
      const sum = number1 + number2;
      result.textContent = `${sum}`;
    };

    // Append elements to the body
    document.body.appendChild(input1);
    // document.body.appendChild(operator);
    document.body.appendChild(input2);
    document.body.insertBefore(operator, input2);
    document.body.appendChild(isSign);
    document.body.appendChild(result);
    document.body.appendChild(document.createElement('br'));
    document.body.appendChild(button);
  }

  sumComponent();




