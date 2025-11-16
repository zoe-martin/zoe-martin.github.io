// Joystick pins
int joyX = A0;
int joyY = A1;
// Buzzer pin
int buzzer = 9;

void setup() {
  Serial.begin(9600);
  // set up buzzer
  pinMode(buzzer, OUTPUT);
}

void loop() {
  int xVal = analogRead(joyX);
  int yVal = analogRead(joyY);

  // send joystick values to p5
  Serial.print(xVal);
  Serial.print(",");
  Serial.println(yVal);

  // commands from p5
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    if (command == "FRUIT") {
      tone(buzzer, 800, 120);  // high-pitch
    }
    else if (command == "DEAD") {
      tone(buzzer, 200, 400);  // low-pitch
    }
  }

  delay(100);
}
