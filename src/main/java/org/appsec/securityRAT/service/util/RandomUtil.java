package org.appsec.securityRAT.service.util;

import java.security.SecureRandom;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.apache.commons.lang.RandomStringUtils;

/**
 * Utility class for generating random Strings.
 */
public final class RandomUtil {

    private static final int DEF_COUNT = 20;
//    private static final SecureRandom rand = new SecureRandom();

    private RandomUtil() {
    }

    /**
     * Generates a password.
     *
     * @return the generated password
     */
    public static String generatePassword() {
        return RandomStringUtils.randomAlphanumeric(DEF_COUNT);
    }

    /**
     * Generates an activation key.
     *
     * @return the generated activation key
     */
    public static String generateActivationKey() {
//    	String result = "";
//    	for (Integer elem : rand.ints(DEF_COUNT).boxed().collect(Collectors.toList())) {
//			result += elem.toString();
//		};
//		return result;
        return RandomStringUtils.randomNumeric(DEF_COUNT);
    }

    /**
    * Generates a reset key.
    *
    * @return the generated reset key
    */
   public static String generateResetKey() {
//	   return rand.ints(DEF_COUNT).toString();
       return RandomStringUtils.randomNumeric(DEF_COUNT);
   }
}
