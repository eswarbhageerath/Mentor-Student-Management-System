import cv2
import os
from keras.models import load_model
import numpy as np
from pygame import mixer


class DrowsinessDetection:
    def __init__(self):
        self.leye = cv2.CascadeClassifier(
            'haar cascade files\haarcascade_lefteye_2splits.xml')
        self.reye = cv2.CascadeClassifier(
            'haar cascade files\haarcascade_righteye_2splits.xml')

        self.model = load_model('models/cnncat2.h5')

        self.thresholdLimit = 0.1

    def PredictEye(self, model, frame, eye):
        pred = []
        for (x, y, w, h) in eye:
            pre_eye = frame[y:y+h, x:x+w]
            pre_eye = cv2.cvtColor(pre_eye, cv2.COLOR_BGR2GRAY)
            pre_eye = cv2.resize(pre_eye, (24, 24))
            pre_eye = pre_eye/255
            pre_eye = pre_eye.reshape(24, 24, -1)
            pre_eye = np.expand_dims(pre_eye, axis=0)
            pred = model.predict(pre_eye)
            break
        return pred

    def Predict(self, frame):

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        left_eye = self.leye.detectMultiScale(gray)
        right_eye = self.reye.detectMultiScale(gray)

        rpred = self.PredictEye(self.model, frame, right_eye)
        lpred = self.PredictEye(self.model, frame, left_eye)

        if lpred == [] or rpred == []:
            return False
        else:
            lpred = lpred[0]
            rpred = rpred[0]
            if(rpred[0] > self.thresholdLimit and lpred[0] > self.thresholdLimit):
                return True
        return False
