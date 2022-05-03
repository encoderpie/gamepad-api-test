let haveEvents = 'GamepadEvent' in window
let haveWebkitEvents = 'WebKitGamepadEvent' in window
let controllers = {}
let rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame

function connecthandler(e) {
  addgamepad(e.gamepad)
}

function vibrate(gamepadIndex) {
  let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [])
  gamepads[gamepadIndex].vibrationActuator.playEffect('dual-rumble', {
    startDelay: 0,
    duration: 2000,
    weakMagnitude: 1,
    strongMagnitude: 1,
  })
}

let axis_count = 0
function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad
  let gamepad_box = document.createElement("div")
  gamepad_box.className = 'gamepad'
  gamepad_box.setAttribute("id", "controller" + gamepad.index)
  let box_title = document.createElement('h3')
  box_title.innerText = "Gamepad: " + gamepad.id
  gamepad_box.appendChild(box_title)
  let buttons = document.createElement("div")
  let buttons_title = document.createElement("h4")
  buttons_title.innerText = 'Buttons:'
  buttons_title.style.margin = '0 0 .6rem -1rem'
  buttons.appendChild(buttons_title)
  buttons.className = "buttons"
  for (let i = 0; i < gamepad.buttons.length; i++) {
    let button = document.createElement("span")
    button.className = "button"
    button.innerHTML = i
    buttons.appendChild(button)
  }
  gamepad_box.appendChild(buttons)
  let axes = document.createElement("div")
  let axes_title = document.createElement("h4")
  axes_title.innerText = 'Axes:'
  axes_title.style.margin = '0 0 .1rem -1rem'
  axes.appendChild(axes_title)
  axes.className = "axes"
  for (let i = 0; i < gamepad.axes.length; i++) {
    let label = document.createElement("label")
    label.innerText = 'Axis '+axis_count+': '
    let meter = document.createElement("meter")
    meter.className = "axis"
    meter.setAttribute("min", "-1")
    meter.setAttribute("max", "1")
    meter.setAttribute("value", "0")
    meter.innerHTML = i
    axes.appendChild(label)
    axes.appendChild(document.createElement("br"))
    axes.appendChild(meter)
    axes.appendChild(document.createElement("br"))
    axis_count += 1
  }
  gamepad_box.appendChild(axes)
  let vibrateButton = document.createElement('button')
  vibrateButton.setAttribute('onclick', 'vibrate('+gamepad.index+')')
  vibrateButton.className = 'vibrate-button'
  vibrateButton.innerText = 'Vibrate Gamepad'
  gamepad_box.appendChild(vibrateButton)
  document.getElementById("start").style.display = "none"
  document.body.appendChild(gamepad_box)
  rAF(updateStatus)
}

function disconnecthandler(e) {
  removegamepad(e.gamepad)
}

function removegamepad(gamepad) {
  let gamepad_box = document.getElementById("controller" + gamepad.index)
  document.body.removeChild(gamepad_box)
  delete controllers[gamepad.index]
}

function updateStatus() {
  scangamepads()
  for (j in controllers) {
    let controller = controllers[j]
    let gamepad = document.getElementById("controller" + j)
    let buttons = gamepad.getElementsByClassName("button")
    for (let i = 0; i < controller.buttons.length; i++) {
      let button = buttons[i]
      let val = controller.buttons[i]
      let pressed = val == 1.0
      let touched = false
      if (typeof(val) == "object") {
        pressed = val.pressed
        if ('touched' in val) {
          touched = val.touched
        }
        val = val.value
      }
      let pct = Math.round(val * 100) + "%"
      button.style.backgroundSize = pct + " " + pct
      button.className = "button"
      if (pressed) {
        button.className += " bg-primary"
      }
      if (touched) {
        button.className += " bg-primary"
      }
    }

    let axes = gamepad.getElementsByClassName("axis")
    for (let i = 0; i < controller.axes.length; i++) {
      let meter = axes[i]
      meter.innerHTML = i + ": " + controller.axes[i].toFixed(4)
      meter.setAttribute("value", controller.axes[i])
    }
  }
  rAF(updateStatus)
}

function scangamepads() {
  let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [])
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && (gamepads[i].index in controllers)) {
      controllers[gamepads[i].index] = gamepads[i]
    }
  }
  if (!controllers[0]) {
    document.getElementById('start').style.display = 'block'
  }
}

let default_text = document.getElementById('start').innerHTML
let dot_count = 0
function dotsAnimate() {
    let dots = document.getElementById('start')
    dots.innerHTML = default_text + '.'.repeat(dot_count)
    dot_count += 1
    if (dot_count > 3) {
        dot_count = 0
    }
}

setInterval(dotsAnimate, 500)

if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler)
  window.addEventListener("gamepaddisconnected", disconnecthandler)
} else if (haveWebkitEvents) {
  window.addEventListener("webkitgamepadconnected", connecthandler)
  window.addEventListener("webkitgamepaddisconnected", disconnecthandler)
} else {
  setInterval(scangamepads, 500)
}