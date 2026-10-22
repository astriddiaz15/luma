#include <Adafruit_NeoPixel.h>

// ============================================================
// LUMA 2026 — firmware del prototipo (Arduino Uno)
//
// Este archivo es el firmware original de "CODIGO LUMA 2026 (1)"
// con ADDICIONES para la comunicacion con la app web:
//   - latido LUMA_ALIVE cada 2 s
//   - comando LUMA_LINK -> parpadeo del LED verde (vinculacion)
//   - comando LUMA_PING -> responde LUMA_ALIVE
//   - re-armado del sensor (evita dobles detecciones)
//   - ciclo verde->2s->blanco 10s->verde sin delay() bloqueante
//     (secuencia original: 2 s antes de encender la tira)
//
// No se elimino ni renombro nada del codigo original:
// pines, mensajes, tiempos y la funcion medirDistancia()
// se conservan identicos.
// ============================================================


// ===============================
// PINES
// ===============================

const int TRIG_PIN = 8;
const int ECHO_PIN = 9;

const int LED_PRINCIPAL = 5; // LED Verde

const int LED_STRIP_PIN = 6;

// SOLO UN LED
const int NUM_PIXELS = 1;

const float DISTANCIA_DETECCION = 3.0;

// El objeto debe alejarse de este punto para volver a detectar (evita duplicados).
// 6 cm: lejos del umbral de 3 cm y comodo respecto a la lectura de reposo (~10.5 cm).
// Con 10 cm el sensor quedaba al limite y podia no re-armarse nunca.
const float DISTANCIA_REARME = 6.0;

// Lecturas consecutivas necesarias para confirmar el acercamiento.
// 1 = comportamiento ORIGINAL (detección inmediata al llegar a 3 cm).
// Se había subido a 2 y el sensor dejó de disparar con la mano: a 3 cm
// el HC-SR04 entrega lecturas alternantes (2.9 / 3.2 cm) y el contador
// se reiniciaba antes de confirmar. El re-armado (> 6 cm) ya evita
// dobles detecciones, así que no hace falta exigir 2 lecturas.
const int LECTURAS_ESTABLES = 1;


// ===============================
// TIRA LED
// ===============================

Adafruit_NeoPixel tira(
  NUM_PIXELS,
  LED_STRIP_PIN,
  NEO_GRB + NEO_KHZ800
);


// ===============================
// PUENTE CON LA APP (USB / Web Serial)
// ===============================

// Comandos que envia la pagina web
const char* CMD_LINK = "LUMA_LINK";
const char* CMD_PING = "LUMA_PING";

// Latido: permite a la app saber que el dispositivo sigue en linea
const unsigned long LATIDO_MS = 2000;
unsigned long ultimoLatido = 0;

// Parpadeo de vinculacion: 3 destellos durante ~3 segundos
const int DESTELLOS_VINCULACION = 3;
const unsigned long DESTELLO_ON_MS = 500;
const unsigned long DESTELLO_OFF_MS = 500;
bool vinculando = false;
int destelloActual = 0;
bool destelloEncendido = false;
bool ledPrevio = true;
unsigned long cambioDestello = 0;

// Comandos entrantes (lectura sin bloquear el loop)
String bufferComando = "";


// ===============================
// MEDIR DISTANCIA
// ===============================

float medirDistancia() {

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  unsigned long duracion = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duracion == 0) {
    return -1;
  }

  return duracion * 0.0343 / 2.0;
}


// ===============================
// ENCENDER Y APAGAR LED BLANCO
// ===============================

void encenderBlanco() {
  tira.setPixelColor(0, tira.Color(255, 255, 255));
  tira.show();
  Serial.println("ORDEN ENVIADA: LED BLANCO");
}

void apagarBlanco() {
  tira.setPixelColor(0, tira.Color(0, 0, 0));
  tira.show();
  Serial.println("ORDEN ENVIADA: APAGAR LED BLANCO");
}


// ===============================
// CICLO DE RUTINA (sin delays bloqueantes)
// Secuencia ORIGINAL: verde off -> 2 s -> blanco 10 s -> verde on
// ===============================

const unsigned long ESPERA_ANTES_BLANCO_MS = 2000;   // original: 2 s
const unsigned long BLANCO_ENCENDIDO_MS = 10000;     // original: 10 s

enum EstadoCiclo { REPOSO, ESPERANDO_BLANCO, BLANCO_ENCENDIDO };
EstadoCiclo estadoCiclo = REPOSO;
unsigned long marcaCiclo = 0;

bool armado = true;
int lecturasCerca = 0;
int lecturasInvalidas = 0;   // diagnóstico: eco ausente (sensor desconectado o sin respuesta)

void actualizarCiclo() {

  unsigned long ahora = millis();

  if (estadoCiclo == ESPERANDO_BLANCO) {

    if (ahora - marcaCiclo >= ESPERA_ANTES_BLANCO_MS) {
      encenderBlanco();
      marcaCiclo = ahora;
      estadoCiclo = BLANCO_ENCENDIDO;
    }

  } else if (estadoCiclo == BLANCO_ENCENDIDO) {

    if (ahora - marcaCiclo >= BLANCO_ENCENDIDO_MS) {
      apagarBlanco();
      digitalWrite(LED_PRINCIPAL, HIGH);
      Serial.println("ACCION REALIZADA");
      Serial.println("REINICIANDO BUSQUEDA...");
      estadoCiclo = REPOSO;
    }
  }
}


// ===============================
// PARPADEO DE VINCULACION (LED verde existente)
// ===============================

void iniciarVinculacion() {

  // Nunca interrumpe una rutina en curso (el sensor sigue midiendo igual)
  if (estadoCiclo != REPOSO || vinculando) {
    Serial.println("VINCULACION: ignorada (rutina en curso)");
    return;
  }

  vinculando = true;
  destelloActual = 0;
  destelloEncendido = true;
  cambioDestello = millis();
  lecturasCerca = 0;
  // Guarda el estado anterior para devolver el LED tal como estaba
  ledPrevio = (digitalRead(LED_PRINCIPAL) == HIGH);
  digitalWrite(LED_PRINCIPAL, HIGH);
  Serial.println("VINCULACION: PARPADEO LED");
}

void actualizarVinculacion() {

  if (!vinculando) {
    return;
  }

  unsigned long ahora = millis();
  unsigned long espera = destelloEncendido ? DESTELLO_ON_MS : DESTELLO_OFF_MS;

  if (ahora - cambioDestello < espera) {
    return;
  }

  cambioDestello = ahora;

  if (destelloEncendido) {

    digitalWrite(LED_PRINCIPAL, LOW);
    destelloEncendido = false;

  } else {

    destelloActual++;

    if (destelloActual >= DESTELLOS_VINCULACION) {
      vinculando = false;
      digitalWrite(LED_PRINCIPAL, ledPrevio ? HIGH : LOW);
      Serial.println("VINCULACION: LED RESTABLECIDO");
      return;
    }

    digitalWrite(LED_PRINCIPAL, HIGH);
    destelloEncendido = true;
  }
}


// ===============================
// COMUNICACION CON LA APP
// ===============================

void procesarComando(String cmd) {

  cmd.trim();

  if (cmd.length() == 0) {
    return;
  }

  if (cmd.equalsIgnoreCase(CMD_LINK)) {
    iniciarVinculacion();
  } else if (cmd.equalsIgnoreCase(CMD_PING)) {
    Serial.println("LUMA_ALIVE");
  }
}

void leerComandos() {

  while (Serial.available()) {

    char c = (char)Serial.read();

    if (c == '\n' || c == '\r') {
      procesarComando(bufferComando);
      bufferComando = "";
    } else if (bufferComando.length() < 32) {
      bufferComando += c;
    }
  }
}

void enviarLatido() {

  unsigned long ahora = millis();

  if (ahora - ultimoLatido < LATIDO_MS) {
    return;
  }

  ultimoLatido = ahora;
  Serial.println("LUMA_ALIVE");
}


// ===============================
// SETUP
// ===============================

void setup() {

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(LED_PRINCIPAL, OUTPUT);

  Serial.begin(9600);

  tira.begin();
  tira.show();

  // Foco principal (verde) encendido
  digitalWrite(LED_PRINCIPAL, HIGH);

  Serial.println("SISTEMA INICIADO");
  Serial.println("LUMA READY | TRIG=8 ECHO=9 LED=5 STRIP=6 | deteccion 3.0 cm");
  Serial.println("Esperando objeto a 3 cm...");
}


// ===============================
// LOOP
// ===============================

void loop() {

  leerComandos();
  enviarLatido();
  actualizarVinculacion();
  actualizarCiclo();

  float distancia = medirDistancia();

  if (distancia > 0) {

    lecturasInvalidas = 0;

    Serial.print("Distancia: ");
    Serial.print(distancia);
    Serial.println(" cm");

    // ===============================
    // DETECCION
    // ===============================

    if (distancia <= DISTANCIA_DETECCION) {

      if (lecturasCerca < LECTURAS_ESTABLES) {
        lecturasCerca++;
      }

    } else {

      lecturasCerca = 0;

      // Re-armado: solo en reposo y cuando el objeto ya se alejo
      if (estadoCiclo == REPOSO && distancia > DISTANCIA_REARME) {
        armado = true;
      }
    }

    if (armado && !vinculando && estadoCiclo == REPOSO && lecturasCerca >= LECTURAS_ESTABLES) {

      Serial.println("OBJETO DETECTADO A 3 CM");

      // 1. Apaga el LED verde principal inmediatamente
      digitalWrite(LED_PRINCIPAL, LOW);
      Serial.println("LED VERDE APAGADO");

      // 2. Espera 2 s antes de encender la tira (sin bloquear)
      marcaCiclo = millis();
      estadoCiclo = ESPERANDO_BLANCO;

      // 3. Evita que la misma deteccion se registre dos veces
      armado = false;
      lecturasCerca = 0;
    }
  } else {

    // Lectura INVALIDA (sin eco): no es una deteccion, es un fallo del sensor.
    // Se informa 1 vez cada 20 intentos fallidos (~2 s) para no inundar el puerto.
    lecturasInvalidas++;
    if (lecturasInvalidas == 20) {
      Serial.println("SENSOR: sin eco (revisar TRIG=8 / ECHO=9 y alimentacion)");
    }
  }

  delay(100);
}
