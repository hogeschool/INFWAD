
  export async function computeSumFromAPI(number1, number2){
    try
    {
      const response = await fetch(`http://localhost:5011/api/sum/?a=${number1}&b=${number2}`, {method: 'GET'});
      const data = await response.json();
      return data; 
    }
    catch {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  export async function computeOperationFromAPI(number1, number2, operator){
    try
    {
      const response = await fetch('http://localhost:5011/api/calculate', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(
                                                            {
                                                                n1 : number1,
                                                                n2 : number2,
                                                                Operator: operator.value
                                                            })
                                    });

      const data = await response.json();
      console.log(`FROM API: ${number1} ${operator.value} ${number2} = ${data}`);
      return data; 
    }
    catch {
      console.error('There was a problem with the fetch operation:', error);
    }
  }
  
  export async function computeOperation(number1, number2, operator){
      let res = 0;
      
      switch (operator.value) {
       case "+":
         const sum = await computeSumFromAPI(number1, number2);
         res = sum;//number1 + number2;
         break;
 
       case "-":
         res = number1 - number2;
         break;
        
       case "*":
         const prod = await computeOperationFromAPI(number1, number2, operator);
         res = prod//number1 * number2;
         break;
      
       case "/":
         res = number1 / number2;
         break;

       default:
         res = 0;
      }
      console.log(`${number1} ${operator.value} ${number2} = ${res}`);
      return res;
    };


  export async function calculatorComponent() {
    
    const input1 = document.createElement('input');
    input1.type = 'number';
    input1.id = 'num1';
    input1.placeholder = 'Enter first number';

    const input2 = document.createElement('input');
    input2.type = 'number';
    input2.id = 'num2';
    input2.placeholder = 'Enter second number';

    //const operator = document.createTextNode(" + ");


    const operator = document.createElement("select");
    const plus = document.createElement("option");
    plus.value = "+";
    plus.text = " + ";
    
    const minus = document.createElement("option");
    minus.value = "-";
    minus.text = " - ";

    const mul = document.createElement("option");
    mul.value = "*";
    mul.text = " x ";
    
    const divide = document.createElement("option");
    divide.value = "/";
    divide.text = " : ";

    operator.add(plus, null);
    operator.add(minus, null);
    operator.add(mul, null);
    operator.add(divide, null);


    const isSign = document.createTextNode(" = ");

    input1.type = 'number';
    input1.id = 'num1';
    input1.placeholder = 'Enter first number';

    const button = document.createElement('button');
    button.textContent = 'Calculate';
    
    // const result = document.createTextNode();
    // result.id = 'result';

    const result = document.createElement("span", null, "not defined")
    result.id = 'result';
    
    button.onclick = async () => {
      const number1 = parseFloat(document.getElementById('num1').value);
      const number2 = parseFloat(document.getElementById('num2').value);
      const value = await computeOperation(number1, number2, operator);
      result.textContent = `${value}`;
      //alert();
    }

    //   button.onclick = () => {
    //   const number1 = parseFloat(document.getElementById('num1').value);
    //   const number2 = parseFloat(document.getElementById('num2').value);
    //   let sum = 0;
    //   switch (operator.value) {
    //    case "+":
    //      sum = number1 + number2;
    //      break;
 
    //    case "-":
    //      sum = number1 - number2;
    //      break;
        
    //    case "*":
    //      sum = number1 * number2;
    //      break;
      
    //    case "/":
    //      sum = number1 / number2;
    //      break;

    //    default:
    //      sum = 0;
    //   }

    //   result.textContent = `${sum}`;
    // };


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