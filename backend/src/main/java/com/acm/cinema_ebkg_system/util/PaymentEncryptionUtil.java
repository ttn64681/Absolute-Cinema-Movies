package com.acm.cinema_ebkg_system.util;

import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class PaymentEncryptionUtil {

    private static final String KEY = System.getenv("AES_KEY");


    public static String encryptCardNumber(String cardNumber) throws Exception {
        try {
            if (KEY == null || KEY.isEmpty()) {
                throw new Exception("AES_KEY environment variable is not set");
            }
            SecretKeySpec key = new SecretKeySpec(hexStringToByteArray(KEY), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(cardNumber.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new Exception("Error encrypting card number", e);
        }
    }

    public static String decryptCardNumber(String encryptedCardNumber) throws Exception {
        try {
            if (KEY == null || KEY.isEmpty()) {
                throw new Exception("AES_KEY environment variable is not set");
            }
            SecretKeySpec key = new SecretKeySpec(hexStringToByteArray(KEY), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decoded = Base64.getDecoder().decode(encryptedCardNumber);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted);
        } catch (Exception e) {
            throw new Exception("Error decrypting card number", e);
        }
    }

    private static byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                                + Character.digit(s.charAt(i+1), 16));
        }
        return data;
    }    
    
}
