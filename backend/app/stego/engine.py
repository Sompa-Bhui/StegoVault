import cv2
import numpy as np
import os
import random
from PIL import Image
from typing import Tuple, Optional

class StegoEngine:
    @staticmethod
    def _to_binary(data):
        """Convert data to binary string."""
        if isinstance(data, str):
            return ''.join([format(ord(i), "08b") for i in data])
        elif isinstance(data, bytes) or isinstance(data, np.ndarray):
            return ''.join([format(i, "08b") for i in data])
        elif isinstance(data, int) or isinstance(data, np.uint8):
            return format(data, "08b")
        else:
            raise TypeError("Type not supported.")

    @staticmethod
    def encode_lsb(image_path: str, secret_data: str, output_path: str) -> bool:
        """Standard LSB embedding."""
        img = cv2.imread(image_path)
        if img is None:
            return False

        # Add a delimiter to mark the end of the secret
        secret_data += "#####"
        binary_secret = StegoEngine._to_binary(secret_data)
        data_len = len(binary_secret)
        
        total_pixels = img.shape[0] * img.shape[1] * 3
        if data_len > total_pixels:
            raise ValueError("Insufficient image capacity for the secret data.")

        data_idx = 0
        for row in img:
            for pixel in row:
                for channel in range(3):
                    if data_idx < data_len:
                        # Replace the least significant bit
                        pixel[channel] = int(format(pixel[channel], '08b')[:-1] + binary_secret[data_idx], 2)
                        data_idx += 1
                    else:
                        break
                if data_idx >= data_len:
                    break
            if data_idx >= data_len:
                break

        cv2.imwrite(output_path, img)
        return True

    @staticmethod
    def decode_lsb(image_path: str) -> str:
        """Standard LSB extraction."""
        img = cv2.imread(image_path)
        if img is None:
            return ""

        binary_data = ""
        for row in img:
            for pixel in row:
                for channel in range(3):
                    binary_data += format(pixel[channel], '08b')[-1]

        # Convert bits to chars
        all_bytes = [binary_data[i: i+8] for i in range(0, len(binary_data), 8)]
        decoded_data = ""
        for byte in all_bytes:
            decoded_data += chr(int(byte, 2))
            if decoded_data[-5:] == "#####":
                return decoded_data[:-5]

        return decoded_data

    @staticmethod
    def encode_random_lsb(image_path: str, secret_data: str, output_path: str, password: str) -> bool:
        """Randomized LSB embedding using a seed from password."""
        img = cv2.imread(image_path)
        if img is None:
            return False

        secret_data += "#####"
        binary_secret = StegoEngine._to_binary(secret_data)
        data_len = len(binary_secret)
        
        h, w, c = img.shape
        total_bits = h * w * c
        if data_len > total_bits:
            raise ValueError("Insufficient capacity.")

        # Create a list of all possible bit positions and shuffle them using the password seed
        random.seed(password)
        positions = list(range(total_bits))
        random.shuffle(positions)
        
        # Use only the first data_len positions
        selected_positions = positions[:data_len]
        
        img_flat = img.flatten()
        for i, bit in enumerate(binary_secret):
            pos = selected_positions[i]
            val = img_flat[pos]
            img_flat[pos] = int(format(val, '08b')[:-1] + bit, 2)
            
        img = img_flat.reshape((h, w, c))
        cv2.imwrite(output_path, img)
        return True

    @staticmethod
    def decode_random_lsb(image_path: str, password: str) -> str:
        """Randomized LSB extraction."""
        img = cv2.imread(image_path)
        if img is None:
            return ""

        h, w, c = img.shape
        total_bits = h * w * c
        
        random.seed(password)
        positions = list(range(total_bits))
        random.shuffle(positions)
        
        img_flat = img.flatten()
        binary_data = ""
        decoded_text = ""
        
        # Extract bit by bit and check for delimiter
        for i in range(total_bits):
            pos = positions[i]
            binary_data += format(img_flat[pos], '08b')[-1]
            
            if len(binary_data) == 8:
                char = chr(int(binary_data, 2))
                decoded_text += char
                binary_data = ""
                if decoded_text[-5:] == "#####":
                    return decoded_text[:-5]
                    
        return decoded_text

    @staticmethod
    def encode_adaptive(image_path: str, secret_data: str, output_path: str) -> bool:
        """Adaptive LSB embedding using Canny edge detection."""
        img = cv2.imread(image_path)
        if img is None:
            return False

        # Convert to grayscale for edge detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        
        # Find coordinates of edge pixels
        edge_coords = np.argwhere(edges > 0)
        
        secret_data += "#####"
        binary_secret = StegoEngine._to_binary(secret_data)
        data_len = len(binary_secret)
        
        if data_len > len(edge_coords) * 3:
            # If not enough edges, fallback to adding non-edge pixels or warn
            # For simplicity, we'll just use what we have and then non-edges if needed
            non_edge_coords = np.argwhere(edges == 0)
            coords = np.vstack((edge_coords, non_edge_coords))
        else:
            coords = edge_coords

        data_idx = 0
        for r, c in coords:
            for channel in range(3):
                if data_idx < data_len:
                    img[r, c, channel] = int(format(img[r, c, channel], '08b')[:-1] + binary_secret[data_idx], 2)
                    data_idx += 1
                else:
                    break
            if data_idx >= data_len:
                break

        cv2.imwrite(output_path, img)
        return True

    @staticmethod
    def decode_adaptive(image_path: str) -> str:
        """Extract data from adaptive embedding."""
        img = cv2.imread(image_path)
        if img is None:
            return ""

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        edge_coords = np.argwhere(edges > 0)
        non_edge_coords = np.argwhere(edges == 0)
        coords = np.vstack((edge_coords, non_edge_coords))
        
        binary_data = ""
        decoded_text = ""
        
        for r, c in coords:
            for channel in range(3):
                binary_data += format(img[r, c, channel], '08b')[-1]
                if len(binary_data) == 8:
                    char = chr(int(binary_data, 2))
                    decoded_text += char
                    binary_data = ""
                    if decoded_text[-5:] == "#####":
                        return decoded_text[:-5]
        
        return decoded_text

    @staticmethod
    def get_histogram(image_path: str) -> dict:
        """Get color histogram for analysis."""
        img = cv2.imread(image_path)
        if img is None:
            return {}
        
        hist_data = {}
        colors = ('b', 'g', 'r')
        for i, col in enumerate(colors):
            hist = cv2.calcHist([img], [i], None, [256], [0, 256])
            hist_data[col] = hist.flatten().tolist()
            
        return hist_data
    @staticmethod
    def calculate_metrics(original_path: str, stego_path: str) -> dict:
        """Calculate PSNR, MSE, and SSIM."""
        img1 = cv2.imread(original_path)
        img2 = cv2.imread(stego_path)
        
        if img1 is None or img2 is None:
            return {}

        # Ensure same size
        if img1.shape != img2.shape:
            img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))

        mse = np.mean((img1 - img2) ** 2.0)
        if mse == 0:
            psnr = 100.0
        else:
            psnr = 20 * np.log10(255.0 / np.sqrt(mse))

        # SSIM calculation
        from skimage.metrics import structural_similarity as ssim
        ssim_val = ssim(img1, img2, channel_axis=2)

        return {
            "psnr": round(float(psnr), 2),
            "mse": round(float(mse), 4),
            "ssim": round(float(ssim_val), 4)
        }
