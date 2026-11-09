const menuToggle = document.querySelector(".menu-toggle");
const primaryMenu = document.querySelector("#primary-menu");
const toggleLabel = menuToggle?.querySelector(".sr-only");
const themeToggle = document.querySelector("#theme-toggle");

if (themeToggle instanceof HTMLButtonElement) {
  themeToggle.addEventListener("click", () => {
    const isLight = document.documentElement.dataset.theme !== "light";
    document.documentElement.dataset.theme = isLight ? "light" : "dark";
    themeToggle.textContent = isLight ? "Dark mode" : "Light mode";
    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Switch to dark mode" : "Switch to light mode",
    );
  });
}

if (
  menuToggle instanceof HTMLButtonElement &&
  primaryMenu instanceof HTMLElement &&
  toggleLabel instanceof HTMLElement
) {
  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    toggleLabel.textContent = isOpen ? "Close navigation" : "Open navigation";
    primaryMenu.classList.toggle("is-open", isOpen);
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  primaryMenu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  window.matchMedia("(min-width: 641px)").addEventListener("change", (event) => {
    if (event.matches) {
      setMenuOpen(false);
    }
  });
}

const calculator = document.querySelector("[data-calculator]");
const calculatorDisplay = calculator?.querySelector("[data-calculator-display]");

if (calculator instanceof HTMLElement && calculatorDisplay instanceof HTMLOutputElement) {
  let displayValue = "0";
  let firstOperand = null;
  let pendingOperator = null;
  let waitingForOperand = false;
  let hasError = false;

  const updateDisplay = () => {
    calculatorDisplay.textContent = displayValue;
  };

  const clearCalculator = () => {
    displayValue = "0";
    firstOperand = null;
    pendingOperator = null;
    waitingForOperand = false;
    hasError = false;
    updateDisplay();
  };

  const showError = (message) => {
    displayValue = message;
    firstOperand = null;
    pendingOperator = null;
    waitingForOperand = true;
    hasError = true;
    updateDisplay();
  };

  const formatResult = (value) => {
    if (!Number.isFinite(value)) {
      return null;
    }

    if (value !== 0 && (Math.abs(value) >= 1e15 || Math.abs(value) < 1e-9)) {
      return value.toExponential(6).replace(/\.?0+e/, "e");
    }

    return Number(value.toPrecision(12)).toString();
  };

  const calculate = (left, right, operator) => {
    switch (operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return right === 0 ? null : left / right;
      default:
        return null;
    }
  };

  const enterDigit = (digit) => {
    if (hasError) {
      clearCalculator();
    }

    if (waitingForOperand) {
      displayValue = digit;
      waitingForOperand = false;
    } else if (displayValue === "0") {
      displayValue = digit;
    } else if (displayValue.length < 15) {
      displayValue += digit;
    }

    updateDisplay();
  };

  const enterDecimal = () => {
    if (hasError) {
      clearCalculator();
    }

    if (waitingForOperand) {
      displayValue = "0.";
      waitingForOperand = false;
    } else if (!displayValue.includes(".")) {
      displayValue += ".";
    }

    updateDisplay();
  };

  const chooseOperator = (operator) => {
    if (hasError) {
      return;
    }

    const currentValue = Number(displayValue);
    if (pendingOperator && !waitingForOperand && firstOperand !== null) {
      const result = calculate(firstOperand, currentValue, pendingOperator);
      const formattedResult = result === null ? null : formatResult(result);
      if (formattedResult === null) {
        showError(pendingOperator === "/" && currentValue === 0 ? "Cannot divide by zero" : "Error");
        return;
      }

      displayValue = formattedResult;
      firstOperand = result;
      updateDisplay();
    } else if (firstOperand === null) {
      firstOperand = currentValue;
    }

    pendingOperator = operator;
    waitingForOperand = true;
  };

  const evaluate = () => {
    if (hasError || pendingOperator === null || firstOperand === null || waitingForOperand) {
      return;
    }

    const rightOperand = Number(displayValue);
    const result = calculate(firstOperand, rightOperand, pendingOperator);
    const formattedResult = result === null ? null : formatResult(result);

    if (formattedResult === null) {
      showError(pendingOperator === "/" && rightOperand === 0 ? "Cannot divide by zero" : "Error");
      return;
    }

    displayValue = formattedResult;
    firstOperand = null;
    pendingOperator = null;
    waitingForOperand = true;
    updateDisplay();
  };

  const backspace = () => {
    if (hasError) {
      clearCalculator();
      return;
    }
    if (waitingForOperand) {
      return;
    }

    displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : "0";
    if (displayValue === "-") {
      displayValue = "0";
    }
    updateDisplay();
  };

  const handleKey = (key) => {
    if (/^\d$/.test(key)) {
      enterDigit(key);
    } else if (key === ".") {
      enterDecimal();
    } else if (["+", "-", "*", "/"].includes(key)) {
      chooseOperator(key);
    } else if (key === "=" || key === "Enter") {
      evaluate();
    } else if (key === "Backspace") {
      backspace();
    } else if (key === "Escape") {
      clearCalculator();
    } else {
      return false;
    }

    return true;
  };

  calculator.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest("[data-calculator-key]");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const key = button.dataset.calculatorKey;
    if (key === "clear") {
      clearCalculator();
    } else if (key === "backspace") {
      backspace();
    } else {
      handleKey(key);
    }
  });

  calculator.addEventListener("keydown", (event) => {
    if (handleKey(event.key)) {
      event.preventDefault();
    }
  });
}

const shoppingCart = document.querySelector("[data-shopping-cart]");

if (shoppingCart instanceof HTMLElement) {
  const productDetails = new Map([
    ["tshirt", { name: "T-Shirt", price: 1500 }],
    ["shoes", { name: "Shoes", price: 5000 }],
    ["backpack", { name: "Backpack", price: 3000 }],
    ["hat", { name: "Hat", price: 1000 }],
  ]);
  const cart = new Map();
  const cartItems = shoppingCart.querySelector("[data-cart-items]");
  const cartEmpty = shoppingCart.querySelector("[data-cart-empty]");
  const cartTotal = shoppingCart.querySelector("[data-cart-total]");
  const clearCartButton = shoppingCart.querySelector("[data-clear-cart]");
  const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

  if (
    cartItems instanceof HTMLUListElement &&
    cartEmpty instanceof HTMLParagraphElement &&
    cartTotal instanceof HTMLParagraphElement &&
    clearCartButton instanceof HTMLButtonElement
  ) {
    const renderCart = () => {
      cartItems.replaceChildren();
      let total = 0;

      for (const [productId, quantity] of cart) {
        const product = productDetails.get(productId);
        if (!product) {
          continue;
        }

        const lineTotal = product.price * quantity;
        total += lineTotal;

        const item = document.createElement("li");
        item.className = "cart-item";
        const details = document.createElement("div");
        details.className = "cart-item-details";
        const name = document.createElement("strong");
        name.className = "cart-item-name";
        name.textContent = product.name;
        const price = document.createElement("span");
        price.className = "cart-line-price";
        price.textContent = formatPrice(lineTotal);
        details.append(name, price);

        const controls = document.createElement("div");
        controls.className = "cart-item-controls";
        const quantityControls = document.createElement("span");
        quantityControls.className = "cart-quantity";

        const decrease = document.createElement("button");
        decrease.className = "quantity-button";
        decrease.type = "button";
        decrease.dataset.cartAction = "decrease";
        decrease.dataset.productId = productId;
        decrease.textContent = "−";
        decrease.setAttribute("aria-label", `Decrease ${product.name} quantity`);
        decrease.disabled = quantity <= 1;

        const quantityText = document.createElement("span");
        quantityText.textContent = String(quantity);

        const increase = document.createElement("button");
        increase.className = "quantity-button";
        increase.type = "button";
        increase.dataset.cartAction = "increase";
        increase.dataset.productId = productId;
        increase.textContent = "+";
        increase.setAttribute("aria-label", `Increase ${product.name} quantity`);

        quantityControls.append(decrease, quantityText, increase);

        const remove = document.createElement("button");
        remove.className = "remove-cart-item";
        remove.type = "button";
        remove.dataset.cartAction = "remove";
        remove.dataset.productId = productId;
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${product.name} from cart`);

        controls.append(quantityControls, remove);
        item.append(details, controls);
        cartItems.append(item);
      }

      cartEmpty.hidden = cart.size > 0;
      clearCartButton.disabled = cart.size === 0;
      cartTotal.textContent = `Total: ${formatPrice(total)}`;
    };

    shoppingCart.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const addButton = event.target.closest("[data-add-product]");
      if (addButton instanceof HTMLButtonElement) {
        const productId = addButton.dataset.addProduct;
        if (productDetails.has(productId)) {
          cart.set(productId, (cart.get(productId) ?? 0) + 1);
          renderCart();
        }
        return;
      }

      const actionButton = event.target.closest("[data-cart-action]");
      if (actionButton instanceof HTMLButtonElement) {
        const productId = actionButton.dataset.productId;
        const quantity = cart.get(productId);
        if (quantity === undefined) {
          return;
        }

        switch (actionButton.dataset.cartAction) {
          case "increase":
            cart.set(productId, quantity + 1);
            break;
          case "decrease":
            if (quantity > 1) {
              cart.set(productId, quantity - 1);
            }
            break;
          case "remove":
            cart.delete(productId);
            break;
        }
        renderCart();
        return;
      }

      if (event.target.closest("[data-clear-cart]")) {
        cart.clear();
        renderCart();
      }
    });

    renderCart();
  }
}

const rpsGame = document.querySelector("[data-rps-game]");

if (rpsGame instanceof HTMLElement) {
  const choices = ["rock", "paper", "scissors"];
  const choiceLabels = {
    rock: "✊ Rock",
    paper: "✋ Paper",
    scissors: "✌️ Scissors",
  };
  const beats = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };
  const picksOutput = rpsGame.querySelector("[data-rps-picks]");
  const resultOutput = rpsGame.querySelector("[data-rps-result]");
  const playerScoreOutput = rpsGame.querySelector("[data-rps-player-score]");
  const computerScoreOutput = rpsGame.querySelector("[data-rps-computer-score]");
  const tiesOutput = rpsGame.querySelector("[data-rps-ties]");
  const resetButton = rpsGame.querySelector("[data-rps-reset]");

  if (
    picksOutput instanceof HTMLParagraphElement &&
    resultOutput instanceof HTMLParagraphElement &&
    playerScoreOutput instanceof HTMLElement &&
    computerScoreOutput instanceof HTMLElement &&
    tiesOutput instanceof HTMLElement &&
    resetButton instanceof HTMLButtonElement
  ) {
    const score = { player: 0, computer: 0, ties: 0 };

    const updateScoreboard = () => {
      playerScoreOutput.textContent = String(score.player);
      computerScoreOutput.textContent = String(score.computer);
      tiesOutput.textContent = String(score.ties);
    };

    const playRound = (playerChoice) => {
      const computerChoice = choices[Math.floor(Math.random() * choices.length)];
      picksOutput.textContent = `You picked ${choiceLabels[playerChoice]}. Computer picked ${choiceLabels[computerChoice]}.`;

      if (playerChoice === computerChoice) {
        score.ties += 1;
        resultOutput.textContent = "It's a Tie!";
      } else if (beats[playerChoice] === computerChoice) {
        score.player += 1;
        resultOutput.textContent = "You Win!";
      } else {
        score.computer += 1;
        resultOutput.textContent = "You Lose!";
      }

      updateScoreboard();
      resultOutput.classList.remove("is-updated");
      void resultOutput.offsetWidth;
      resultOutput.classList.add("is-updated");
    };

    rpsGame.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const choiceButton = event.target.closest("[data-rps-choice]");
      if (choiceButton instanceof HTMLButtonElement) {
        const playerChoice = choiceButton.dataset.rpsChoice;
        if (choices.includes(playerChoice)) {
          playRound(playerChoice);
        }
        return;
      }

      if (event.target.closest("[data-rps-reset]")) {
        score.player = 0;
        score.computer = 0;
        score.ties = 0;
        picksOutput.textContent = "Pick a move to start!";
        resultOutput.textContent = "Ready when you are.";
        resultOutput.classList.remove("is-updated");
        updateScoreboard();
      }
    });
  }
}
