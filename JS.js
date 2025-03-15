'use strict';

class MenuButtonActions {
  constructor(domNode, performMenuAction) {
    this.domNode = domNode;
    this.performMenuAction = performMenuAction;
    this.buttonNode = domNode.querySelector('button');
    this.menuNode = domNode.querySelector('[role="menu"]');
    this.menuitemNodes = [];
    this.firstMenuitem = null;
    this.lastMenuitem = null;
    this.firstChars = [];

    // Add event listeners for button interactions
    this.buttonNode.addEventListener('keydown', this.onButtonKeydown.bind(this));
    this.buttonNode.addEventListener('click', this.onButtonClick.bind(this));

    // Query and iterate over menu items, setting up event listeners
    const nodes = domNode.querySelectorAll('[role="menuitem"]');

    nodes.forEach((menuitem, index) => {
      this.menuitemNodes.push(menuitem);
      menuitem.tabIndex = index === 0 ? 0 : -1; // Set first item as tabbable
      this.firstChars.push(menuitem.textContent.trim()[0].toLowerCase());

      menuitem.addEventListener('keydown', this.onMenuitemKeydown.bind(this));
      menuitem.addEventListener('click', this.onMenuitemClick.bind(this));
      menuitem.addEventListener('mouseover', this.onMenuitemMouseover.bind(this));

      if (!this.firstMenuitem) {
        this.firstMenuitem = menuitem;
      }
      this.lastMenuitem = menuitem;
    });

    // Add focusin and focusout event listeners for handling focus styles
    domNode.addEventListener('focusin', this.onFocusin.bind(this));
    domNode.addEventListener('focusout', this.onFocusout.bind(this));

    // Add mousedown event listener on window to handle clicks outside the menu
    window.addEventListener('mousedown', this.onBackgroundMousedown.bind(this), true);
  }

  setFocusToMenuitem(newMenuitem) {
    this.menuitemNodes.forEach(item => {
      if (item === newMenuitem) {
        item.tabIndex = 0;
        item.focus();
      } else {
        item.tabIndex = -1;
      }
    });
  }

  setFocusToPreviousMenuitem(currentMenuitem) {
    let index = this.menuitemNodes.indexOf(currentMenuitem);
    let newIndex = index > 0 ? index - 1 : this.menuitemNodes.length - 1;
    this.setFocusToMenuitem(this.menuitemNodes[newIndex]);
  }

  setFocusToNextMenuitem(currentMenuitem) {
    let index = this.menuitemNodes.indexOf(currentMenuitem);
    let newIndex = index < this.menuitemNodes.length - 1 ? index + 1 : 0;
    this.setFocusToMenuitem(this.menuitemNodes[newIndex]);
  }

  onMenuitemKeydown(event) {
    const tgt = event.currentTarget;
    const key = event.key;
    let flag = false;

    switch (key) {
      case 'ArrowUp':
      case 'Up':
        this.setFocusToPreviousMenuitem(tgt);
        flag = true;
        break;

      case 'ArrowDown':
      case 'Down':
        this.setFocusToNextMenuitem(tgt);
        flag = true;
        break;

      case 'Enter':
      case ' ':
        this.closePopup();
        this.performMenuAction(tgt);
        this.buttonNode.focus();
        flag = true;
        break;

      case 'Escape':
      case 'Esc':
        this.closePopup();
        this.buttonNode.focus();
        flag = true;
        break;
    }

    if (flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onButtonClick(event) {
    if (this.isOpen()) {
      this.closePopup();
      this.buttonNode.focus();
    } else {
      this.openPopup();
      this.setFocusToMenuitem(this.firstMenuitem);
    }
    event.preventDefault();
  }

  openPopup() {
    this.menuNode.style.display = 'block';
    this.buttonNode.setAttribute('aria-expanded', 'true');
  }

  closePopup() {
    if (this.isOpen()) {
      this.buttonNode.removeAttribute('aria-expanded');
      this.menuNode.style.display = 'none';
    }
  }

  isOpen() {
    return this.buttonNode.getAttribute('aria-expanded') === 'true';
  }

  onBackgroundMousedown(event) {
    if (!this.domNode.contains(event.target) && this.isOpen()) {
      this.closePopup();
      this.buttonNode.focus();
    }
  }

  onMenuitemClick(event) {
    this.closePopup();
    this.buttonNode.focus();
    this.performMenuAction(event.currentTarget);
  }

  onMenuitemMouseover(event) {
    event.currentTarget.focus();
  }
}

// Initialize menu buttons
window.addEventListener('load', function () {
  document.getElementById('action_output').value = 'none';

  function performMenuAction(node) {
    document.getElementById('action_output').value = node.textContent.trim();
  }

  document.querySelectorAll('.menu-button-actions').forEach(menu => {
    new MenuButtonActions(menu, performMenuAction);
  });
});
