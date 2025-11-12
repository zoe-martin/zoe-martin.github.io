#include <Servo.h>

const int servoPin = 3;  // Servo signal pin

Servo myServo;

void setup() {
  Serial.begin(9600);
  myServo.attach(servoPin);

}

void loop() {
   if (Serial.available() > 0) {
    int angle = Serial.parseInt();
    myServo.write(angle);
  }

}