from datetime import datetime
from db_door_status import insertDocument
from time import time
import face_recognition
import cv2
import os
import numpy as np

# ----------------- Facial Recognition -----------------
#load all images in the persons folder, take the folder name as the name of the person
def load_person_images():
    face_encodings = []
    flatten_names = []
    for folder in os.listdir("persons"):
        is_directory = os.path.isdir(f"persons/{folder}") 
        if is_directory:
            name = folder
            for filename in os.listdir(f"persons/{folder}"):
                image = face_recognition.load_image_file(f"persons/{folder}/{filename}")
                encoding = face_recognition.face_encodings(image)[0]
                face_encodings.append(encoding)
                flatten_names.append(name)
    return face_encodings, flatten_names

known_face_encodings, persons_flatten_names = load_person_images()

# Threshold color to compare the mean brightness of the frame
brightness_color = 35

process_every_frames = 2
counter = 0

face_locations = []

process_every_frames = True
def handle_image(frame, last_status = "", persons = [], door_document = {"open": 0, "closed" : 0, "persons": ["Unknown"]}):
    global known_face_encodings, persons_flatten_names, process_every_frames, counter, face_locations
    current_status = ""
    
    # Convert frame to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Calculate the average brightness of the frame
    avg_brightness = np.mean(gray)
    
    # Determine door status based on brightness, compared to mean brightness of the frame
    if avg_brightness > brightness_color:
        current_status = "open"
    else:
        current_status = "closed"

    if current_status != last_status:
        # Update the last status
        last_status = current_status
        # If the door is closed, update the closed timestamp and insert the document
        if current_status == "closed":
            door_document["closed"] = time() * 1000
            if door_document["open"] != 0 and door_document["closed"] != 0:
                door_document["persons"] = persons
                insertDocument(door_document)
                door_document = {"open": 0, "closed" : 0, "persons": ["Unknown"]}
            persons = []
        elif current_status == "open":
            # If the door is open, update the open timestamp
            door_document["open"] = time() * 1000
    # If the door is open, perform facial recognition
    # Only process every other frame of video to save time
    # Note the first frame will be skipped
    elif current_status == "open":
        # Only process every other frame of video to save time
        if process_every_frames == counter:
            # Resize frame of video to a smaller size for faster face recognition processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.20, fy=0.20)

            # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

            # Find all the faces and face encodings in the current frame of video
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

            for face_encoding in face_encodings:
                # See if the face is a match for the known face(s)
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
                name = "Unknown"

                # Or instead, use the known face with the smallest distance to the new face
                face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    #get index of name in  by first converting the list of dictionaries to a list of indexes and then getting the name by index
                    name = persons_flatten_names[best_match_index]
                if name not in persons:
                    persons.append(name)
            """ if not persons:
                if "Unknown" not in persons:
                    persons.append("Unknown") """

        #process_every_frames = not process_every_frames
        # Display the results
        if face_locations:
            for (top, right, bottom, left), name in zip(face_locations, persons):
                # Scale back up face locations since the frame we detected in was scaled to 1/4 size
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4

                # Draw a box around the face
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

                # Draw a label with a name below the face
                cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
                font = cv2.FONT_HERSHEY_DUPLEX
                cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
    
    counter += 1
    if(counter > process_every_frames):
        counter = 0
    return frame, last_status, persons, door_document