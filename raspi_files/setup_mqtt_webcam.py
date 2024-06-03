import paho.mqtt.publish as publish
import cv2
import base64
from time import sleep

#camera_index is the video device number of the camera 
camera_index = 0
cam = cv2.VideoCapture(camera_index)

while True:
 ret, image = cam.read()
 height, width = image.shape[:2]
 max_height = 600
 max_width = 600

# only shrink if img is bigger than required
 if max_height < height or max_width < width:
  # get scaling factor
  scaling_factor = max_height / float(height)
 if max_width/float(width) < scaling_factor:
  scaling_factor = max_width / float(width)
  # resize image
  image = cv2.resize(image, None, fx=scaling_factor, fy=scaling_factor, interpolation=cv2.INTER_AREA)
  
 im_encode = cv2.imencode(".jpg", image)[1]
 string_im = base64.b64encode(im_encode)
 publish.single("webcam", string_im, hostname="localhost")
 sleep(1/3)
 k = cv2.waitKey(1)
 if k != -1:
  break
cam.release()
cv2.destroyAllWindows()
