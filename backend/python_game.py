import cv2
import numpy as np
import random
import time
import math
import socket
import threading

# Load background and flag
background_path = 'brazil_1.jpeg'
flag_path = 'brazil_flag.png'

background = cv2.imread(background_path)
flag = cv2.imread(flag_path, cv2.IMREAD_UNCHANGED)

# Resize the flag to make it smaller
scale_factor = 0.15  # 15% of original size
flag = cv2.resize(flag, (int(flag.shape[1] * scale_factor), int(flag.shape[0] * scale_factor)), interpolation=cv2.INTER_AREA)

# Function to generate a random position for the flag within the background
def generate_flag_position(background, flag):
    bg_h, bg_w = background.shape[:2]
    flag_h, flag_w = flag.shape[:2]
    max_x = bg_w - flag_w
    max_y = bg_h - flag_h
    rand_x = random.randint(0, max_x)
    rand_y = random.randint(0, max_y)
    return rand_x, rand_y

# Function to overlay the flag with adjustable opacity onto the background
def add_flag(background, flag, position, opacity=0.5):
    x, y = position
    flag_h, flag_w = flag.shape[:2]
    alpha = flag[:, :, 3] / 255.0  # Normalize alpha to [0, 1]
    alpha = alpha * opacity  # Apply the desired opacity to the alpha channel
    flag_bgr = flag[:, :, :3]
    roi = background[y:y+flag_h, x:x+flag_w].astype(np.float32)  # Convert to float for blending
    for c in range(3):  # For each color channel
        roi[:, :, c] = (1 - alpha) * roi[:, :, c] + alpha * flag_bgr[:, :, c]
    background[y:y+flag_h, x:x+flag_w] = roi.astype(np.uint8)  # Convert back to uint8

# Function to check if a click is inside the flag's bounding box
def is_click_inside_flag(x, y):
    flag_x, flag_y = flag_position
    flag_w, flag_h = flag_size
    return flag_x <= x <= flag_x + flag_w and flag_y <= y <= flag_y + flag_h

# Function to calculate distance
def calculate_distance(pt1, pt2):
    return math.sqrt((pt1[0] - pt2[0]) ** 2 + (pt1[1] - pt2[1]) ** 2)

# Function to send score to the server
def send_score_to_server(score):
    host = 'localhost'
    port = 3001
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((host, port))
        s.sendall(f'Score: {score}'.encode())
        response = s.recv(1024).decode()
        print('Received from server:', response)

# Click event function
def click_event(event, x, y, flags, param):
    global start_time, game_over, score
    if event == cv2.EVENT_LBUTTONDOWN and not game_over:
        game_over = True
        time_taken = time.time() - start_time
        if is_click_inside_flag(x, y):
            points = 100 + (30 - time_taken)
            print(f"✅ Perfect Click! Full Points! 🏆 Time: {time_taken:.2f}s, Score: {score + round(points)}")
        else:
            distance_to_flag = calculate_distance((x, y), flag_position)
            points = max(0, 100 - (distance_to_flag / 10)) + (30 - time_taken)
            print(f"Distance: {distance_to_flag:.2f}, Time: {time_taken:.2f}s, Score: {score + round(points)}")
        score = max(0, round(points))
        # Send the score to the server
        threading.Thread(target=send_score_to_server, args=(score,)).start()

# Game loop function
def play_game():
    global start_time, game_over, score, flag_position, flag_size
    background_copy = background.copy()
    flag_size = (flag.shape[1], flag.shape[0])
    flag_position = generate_flag_position(background, flag)  # Random placement
    add_flag(background_copy, flag, flag_position)  # Place the flag directly onto the background
    cv2.imshow('Find the Hidden Flag!', background_copy)
    cv2.setMouseCallback('Find the Hidden Flag!', click_event)
    start_time = time.time()
    score = 0
    game_over = False
    while not game_over:
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    print(f"🛑 Game Over! Final Score: {score}")
    cv2.destroyAllWindows()

# Start the game
play_game()
