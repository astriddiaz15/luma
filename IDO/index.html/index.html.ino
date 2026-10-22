#include <Adafruit_NeoPixel.h>

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


// ===============================
// TIRA LED
// ===============================

Adafruit_NeoPixel tira(
  NUM_PIXELS,
  LED_STRIP_PIN,
  NEO_GRB + NEO_KHZ800
);


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
  Serial.println("Esperando objeto a 3 cm...");
}


// ===============================
// LOOP
// ===============================

void loop() {

  float distancia = medirDistancia();

  if (distancia > 0) {

    Serial.print("Distancia: ");
    Serial.print(distancia);
    Serial.println(" cm");


    // ===============================
    // DETECCIÓN
    // ===============================

    if (distancia <= DISTANCIA_DETECCION) {

      Serial.println("OBJETO DETECTADO A 3 CM");

      // 1. Apaga el LED verde principal inmediatamente
      digitalWrite(LED_PRINCIPAL, LOW);
      Serial.println("LED VERDE APAGADO");

      // 2. Espera 1 segundo antes de encender la tira
      delay(1000);

      // 3. Prende la tira LED
      encenderBlanco();

      // 4. Se mantiene prendida por 10 segundos
      delay(10000);

      // 5. Apaga la tira LED y restablece el LED verde principal
      apagarBlanco();
      digitalWrite(LED_PRINCIPAL, HIGH);

      // 6. Notificación de ciclo finalizado a la computadora
      Serial.println("ACCION REALIZADA");
      Serial.println("REINICIANDO BÚSQUEDA...");
    }
  }

  delay(100);
}