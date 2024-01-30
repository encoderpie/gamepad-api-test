var haveEvents = 'GamepadEvent' in window
var haveWebkitEvents = 'WebKitGamepadEvent' in window
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame

const controllers = {}
const gamepadlist = document.getElementById("gamepadContainer")
  
const products = [
  {Vendor: '0000', Product: '006f', Name: 'JessTechColourRumblePad'},
  {Vendor: '0001', Product: '0329', Name: 'Sl6566'},
  {Vendor: '0005', Product: '05ac', Name: 'Mocute'},
  {Vendor: '0010', Product: '0082', Name: 'AkishopCustomsPs360Plus'},
  {Vendor: '0078', Product: '0006', Name: 'MicrontekUsbJoystick'},
  {Vendor: '0079', Product: '0006', Name: 'PcTwinShock'},
  {Vendor: '0079', Product: '0011', Name: 'DragonRiseGamepad'},
  {Vendor: '054c', Product: '0268', Name: 'Sony PS3 Dualshock'},
  {Vendor: '054c', Product: '042f', Name: 'SplitFishFragFx'},
  {Vendor: '054c', Product: '05c4', Name: 'Sony PS4 Dualshock'},
  {Vendor: '054c', Product: '05c5', Name: 'StrikePackFpsDominator'},
  {Vendor: '054c', Product: '09cc', Name: 'Sony PS4 Dualshock'},
  {Vendor: '054c', Product: '0ba0', Name: 'Sony PS4 Dualshock'},
  {Vendor: '050d', Product: '0802', Name: 'NostromoN40'},
  {Vendor: '050d', Product: '0803', Name: 'NostromoN45'},
  {Vendor: '0738', Product: 'b738', Name: 'MarvelVsCapcom2TeFightStickXbox Controller 360'},
  {Vendor: '0738', Product: 'beef', Name: 'JoytechNeoSeAdvancedXbox Controller 360'},
  {Vendor: '0738', Product: 'cb02', Name: 'SaitekCyborgRumblePadXbox Controller 360'},
  {Vendor: '0738', Product: 'cb03', Name: 'SaitekP3200RumblePadXbox Controller 360'},
  {Vendor: '050d', Product: '0802', Name: 'NostromoN40'},
  {Vendor: '050d', Product: '0803', Name: 'NostromoN45'},
  {Vendor: '0738', Product: 'b738', Name: 'MarvelVsCapcom2TeFightStickXbox Controller 360'},
  {Vendor: '0738', Product: 'beef', Name: 'JoytechNeoSeAdvancedXbox Controller 360'},
  {Vendor: '0738', Product: 'cb02', Name: 'SaitekCyborgRumblePadXbox Controller 360'},
  {Vendor: '0738', Product: 'cb03', Name: 'SaitekP3200RumblePadXbox Controller 360'},
  {Vendor: '0e8f', Product: '3013', Name: 'HuiJiaSnesController'},
  {Vendor: '0e8f', Product: '3075', Name: 'GreenAsiaPsGamepad'},
  {Vendor: '0e8f', Product: '310d', Name: 'Gamepad3Turbo'},
  {Vendor: '0f0d', Product: '000a', Name: 'DeadOrAlive4FightStickXbox Controller 360'},
  {Vendor: '15e4', Product: '3f0a', Name: 'AirFlo'},
  {Vendor: '15e4', Product: '3f10', Name: 'Batarang'},
  {Vendor: '162e', Product: 'beef', Name: 'JoytechNeoSeTake2'}
]

const getGamepadName = (gamepad) => {
  try {
    const Vendor = gamepad.id.split('Vendor')[1].split('Product')[0].split(':')[1].trim()
    const Product = gamepad.id.split('Product')[1].split(')')[0].split(':')[1].trim()
    const Name = products.find(product => product.Vendor === Vendor && product.Product === Product).Name
    console.log(Vendor, Product, Name)
    
    return Name
  } catch (error) {
    return gamepad.index + '. Controller'
  }
}

function vibrateGamepad(gamepadIndex) {
  const duration = document.getElementById(`vibration-duration-${gamepadIndex}`).value;
  const weakMagnitude = document.getElementById(`vibration-weak-${gamepadIndex}`).value;
  const strongMagnitude = document.getElementById(`vibration-strong-${gamepadIndex}`).value;

  const gamepad = controllers[gamepadIndex];
  if (gamepad && gamepad.vibrationActuator && gamepad.vibrationActuator.type === "dual-rumble") {
    gamepad.vibrationActuator.playEffect("dual-rumble", {
      startDelay: 0,
      duration: parseInt(duration, 10),
      weakMagnitude: parseFloat(weakMagnitude),
      strongMagnitude: parseFloat(strongMagnitude)
    });
  }
}


const createGamepadElement = (gamepad) => {
  const buttonsHtml = gamepad.buttons.map((button, index) => 
    `<div class="button">
      <div class="opacity-60">Button ${index}</div>
      <div class="valueStatus">Value: 0.00</div>
    </div>`  
  ).join('')

  const axesHtml = gamepad.axes.map((axis, index) => 
    `<div class="mx-auto axis-${index}">
       <div class="opacity-60">Axis ${index}</div>
       <div>Value: ${axis.toFixed(2)}</div>
     </div>`
  ).join('')

  const createXYGraphHtml = (idSuffix) => `
    <div class="border mx-auto w-50 h-50 rounded">
      <div class="relative border border-gray-400 w-[200px] h-[200px] rounded-full" id="xy-graph-${gamepad.index}-${idSuffix}">
        <div class="absolute z-10 w-2.5 h-2.5 bg-red-500 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" id="xy-point-${gamepad.index}-${idSuffix}"></div>
        <div class="absolute z-5 left-1/2 top-0 bottom-0 border-l border-gray-300"></div>
        <div class="absolute z-5 top-1/2 left-0 right-0 border-t border-gray-300"></div>
        <div class="absolute left-1/2 bottom-0 mb-1 ms-0.5 text-xs opacity-60">y</div>
        <div class="absolute top-1/2 right-0 me-1 text-xs opacity-60">x</div>
      </div>
    </div>
  `
  const vibrationControlsHtml = `
    <div class="text-base grid grid-cols-4 gap-4">
      <div>
        <label>Weak Magnitude</label>
        <input type="range" id="vibration-weak-${gamepad.index}" min="0" max="1" step="0.1" value="1.0" class="w-full">
      </div>
      <div>
        <label>Strong Magnitude</label>
        <input type="range" id="vibration-strong-${gamepad.index}" min="0" max="1" step="0.1" value="1.0" class="w-full">
      </div>
      <div>
        <label>Duration (1s-5s)</label>
        <input type="range" id="vibration-duration-${gamepad.index}" min="100" max="5000" value="5000" class="w-full">
      </div>
      <div class="mx-auto">
        <button onclick="vibrateGamepad(${gamepad.index})" class="bg-slate-100 hover:bg-slate-200/70 transition-all rounded p-3 px-6">Vibrate</button>
      </div>
    </div>
  `;

  const xyGraphHtml1 = createXYGraphHtml("1")
  const xyGraphHtml2 = createXYGraphHtml("2")

  return `
  <div class="w-full bg-white rounded-md p-5 md:p-7 space-y-5 shadow-md shadow-slate-200" id="controller_${gamepad.index}">
    <div>
      <div class="font-bold text-3xl gamepad-name">
        ${getGamepadName(gamepad)}
      </div>
      ID: ${gamepad.id}
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 pt-5 border-t">
      <div class="space-y-3">
        <div class="text-base border-s-4 border-blue-300 rounded rounded-e-xl bg-slate-50 p-4 grid grid-cols-3 md:grid-cols-5 gap-5">
          <div class="bg-white rounded p-1 outline outline-offset-4 outline-slate-200/70">
            <div class="opacity-60">INDEX</div>
            <div class="index">${gamepad.index}</div>
          </div>
          <div class="bg-white rounded p-1 outline outline-offset-4 outline-green-400">
            <div class="opacity-60">CONNECTED</div>
            <div class="connected">${gamepad.connected ? "yes" : "no"}</div>
          </div>
          <div class="bg-white rounded p-1 outline outline-offset-4 outline-slate-200/70">
            <div class="opacity-60">MAPPING</div>
            <div class="mapping">${gamepad.mapping}</div>
          </div>
          <div class="bg-white rounded p-1 outline outline-offset-4 outline-slate-200/70">
            <div class="opacity-60">TIMESTAMP</div>
            <div class="timestamp">${gamepad.timestamp}</div>
          </div>
          <div class="bg-white rounded p-1 outline outline-offset-4 outline-red-400/80">
            <div class="opacity-60">VIBRATION</div>
            <div class="vibrationActuator">${gamepad.vibrationActuator ? "yes" : "no"}</div>
          </div>
          <div class="bg-white rounded p-1 outline outline-offset-4 outline-slate-200/70">
            <div class="opacity-60">POSE</div>
            <div class="pose">${gamepad.pose || '~'}</div>
          </div>
          <div class="bg-white rounded p-1 outline outline-offset-4 outline-slate-200/70">
            <div class="opacity-60">HAND</div>
            <div class="hand">${gamepad.hand || '~'}</div>
          </div>
          <div class="bg-white rounded p-1 outline outline-offset-4 outline-slate-200/70">
            <div class="opacity-60">DISPLAY ID</div>
            <div class="displayId">${gamepad.displayId || '~'}</div>
          </div>
          <div class="bg-white rounded p-1 outline outline-offset-4 outline-slate-200/70 md:col-span-2">
            <div class="opacity-60">HAPTIC ACTUATORS</div>
            <div class="hapticActuators">${gamepad.hapticActuators || '~'}</div>
          </div>
        </div>
        <div class="border-b pb-1 w-full">
          BUTTONS
        </div>
        <div class="text-base grid grid-cols-6 gap-4 buttons">
          ${buttonsHtml}
        </div>
      </div>

      <div class="space-y-3">
        <div class="border-b pb-1 w-full">
          AXES
        </div>
        <div class="text-base grid grid-cols-4 gap-4">
          ${axesHtml}
          <div class="col-span-5 grid grid-cols-2 gap-4">
            ${xyGraphHtml1}  
            ${xyGraphHtml2}  
          </div>
        </div>
        ${gamepad.vibrationActuator ? `
        <div class="border-b pb-1 w-full">
          VIBRATION
        </div>
        ${vibrationControlsHtml}` : ''}
      </div>

    </div>
  </div>`
}


const updateStatus = () => {
  scanGamepads()
  Object.keys(controllers).forEach(j => {
    const controller = controllers[j]
    const controllerElement = document.getElementById("controller_" + j)
    const buttonElements = controllerElement.getElementsByClassName("button")

    controller.buttons.forEach((button, buttonIndex) => {
      const buttonElement = buttonElements[buttonIndex];
      let val = button;
      let pressed = val === 1.0;
      let touched = false;
    
      if (typeof(val) === "object") {
        pressed = val.pressed;
        touched = 'touched' in val && val.touched;
        val = val.value;
      }
    
      const pct = Math.round(val * 100) + "%";
      buttonElement.getElementsByClassName("valueStatus")[0].innerText =  val.toFixed(2);
      buttonElement.style.backgroundSize = pct + " " + pct;
      buttonElement.className = "button" + (pressed ? " pressed" : "") + (touched ? " touched" : "");
    })
    
    controller.axes.forEach((axis, axisIndex) => {
      const axisElement = controllerElement.getElementsByClassName(`axis-${axisIndex}`)[0]
      if (axisElement) {
        axisElement.innerText = `Value: ${axis.toFixed(2)}`;
      }
    })
    
    for (let key in controller) {
      if (!Array.isArray(controller[key])) {
        const element = controllerElement.getElementsByClassName(key)[0]
        if (element) {
          if (key === "connected") {
            element.innerText = controller[key] ? "yes" : "no"
          } else if (key === "vibrationActuator") {
            element.innerText = controller[key] ? controller[key].type : 'no'
          } else {
            element.innerText = controller[key]
          }
        }
      }
    }


    updateXYGraph(controller, j, "1", 0, 1)
    updateXYGraph(controller, j, "2", 2, 3)
  })

  rAF(updateStatus)
}


// XY grafiğindeki noktanın konumunu güncelleyen yardımcı fonksiyon
function updateXYGraph(controller, index, graphSuffix, xAxisIndex, yAxisIndex) {
  const xValue = controller.axes[xAxisIndex]
  const yValue = controller.axes[yAxisIndex]

  const point = document.getElementById(`xy-point-${index}-${graphSuffix}`)
  const graph = document.getElementById(`xy-graph-${index}-${graphSuffix}`)

  if (point && graph) {
    const xPosition = (xValue + 1) / 2 * graph.offsetWidth
    const yPosition = (yValue + 1) / 2 * graph.offsetHeight
    
    point.style.left = `${xPosition}px`
    point.style.top = `${yPosition}px`
  }
}


const gamepadHandler = (e, connected) => {
  const gamepad = e.gamepad

  if (connected) {
    if (gamepad.index in controllers) {
      controllers[gamepad.index].connected = true
      const gamepadDiv = document.getElementById(`controller_${gamepad.index}`)
      if (gamepadDiv) {
        gamepadDiv.classList.remove('opacity-50')
        const gamepadNameDiv = gamepadDiv.getElementsByClassName(`gamepad-name`)[0]
        gamepadNameDiv.innerText = getGamepadName(gamepad)
      }
    } else {
      console.log("Gamepad connected.", gamepad)
      controllers[gamepad.index] = gamepad
      gamepadlist.insertAdjacentHTML('beforeend', createGamepadElement(gamepad))
      rAF(updateStatus)
    }
  } else {
    console.log("Gamepad disconnected.", gamepad)
    const gamepadDiv = document.getElementById(`controller_${gamepad.index}`)
    if (gamepadDiv) {
      gamepadDiv.classList.add('opacity-50')
      controllers[gamepad.index].connected = false
      const gamepadNameDiv = gamepadDiv.getElementsByClassName(`gamepad-name`)[0]
      gamepadNameDiv.innerText = getGamepadName(gamepad) + ' (DISCONNECTED)'
    }
  }
}

const scanGamepads = () => {
  let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [])
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && (gamepads[i].index in controllers)) {
      controllers[gamepads[i].index] = gamepads[i]
    }
  }
}


if (haveEvents) {
  window.addEventListener("gamepadconnected",
    (e) => gamepadHandler(e, true)
  )
  window.addEventListener("gamepaddisconnected",
    (e) => gamepadHandler(e, false)
  )
} else if (haveWebkitEvents) {
  window.addEventListener("webkitgamepadconnected",
    (e) => gamepadHandler(e, true)
  )
  window.addEventListener("webkitgamepaddisconnected",
    (e) => gamepadHandler(e, false)
  )
} else {
  setInterval(scanGamepads, 500)
}


let default_text = document.getElementById('start').innerHTML
let dot_count = 0
const dotsAnimate = () => {
    let dots = document.getElementById('start')
    dots.innerHTML = default_text + '.'.repeat(dot_count)
    dot_count += 1
    if (dot_count > 3) {
        dot_count = 0
    }
}

setInterval(dotsAnimate, 500)


// Sanal Gamepad Nesnesi Oluşturma
function createVirtualGamepad() {
  let firstArray = Array(17).fill({
    pressed: false,
    touched: false,
    value: 0
  })
  
  let secondArray = Array(1).fill({
    pressed: true,
    touched: true,
    value: 0.7
  })
  
  let combinedButtons = firstArray.concat(secondArray)

  
  return {
    id: "Sony Interactive Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)",
    index: 0,
    connected: true,
    timestamp: '92274.00000',
    mapping: 'standard',
    axes: [0.6, 0.2, 0.2, 0.5], // Oyun pedinizdeki ekseni temsil eder
    buttons: combinedButtons,
    vibrationActuator: null // Eğer gamepad'iniz titreşim özelliğine sahipse
  }
}

// Sanal Gamepad'i Gamepad API'ye Ekleyerek Test Etme
function simulateGamepadConnection() {
  var virtualGamepad = createVirtualGamepad()
  
  // Gamepad bağlanmış gibi davran
  gamepadHandler({ gamepad: virtualGamepad }, true)
}

// Bu fonksiyonu çağırarak testi başlatın
//simulateGamepadConnection()