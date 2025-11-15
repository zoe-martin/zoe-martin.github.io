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

  // Send joystick values to p5
  Serial.print(xVal);
  Serial.print(",");
  Serial.println(yVal);

  // Listen for commands from p5
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    if (command == "BUZZ") {
      tone(buzzer, 1000, 150); // short beep
    }
  }

  delay(100);
}
