/**
 * AddressParsingUtil.java
 * 
 * Place this file in your backend:
 * src/main/java/com/example/homy/util/AddressParsingUtil.java
 * 
 * This utility parses structured address strings into components (house, area, city, pincode, landmark)
 * similar to the frontend manage-bookings component logic.
 */

package com.example.homy.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.HashMap;
import java.util.Map;

public class AddressParsingUtil {

    /**
     * Parse address string into structured components
     * @param address Full address string
     * @return Map with keys: house, area, city, pincode, landmark
     */
    public static Map<String, String> parseAddress(String address) {
        Map<String, String> result = new HashMap<>();
        result.put("house", getAddressPart(address, "house"));
        result.put("area", getAddressPart(address, "area"));
        result.put("city", getAddressPart(address, "city"));
        result.put("pincode", getAddressPart(address, "pincode"));
        result.put("landmark", getAddressPart(address, "landmark"));
        result.put("fullAddress", address != null ? address : "N/A");
        return result;
    }

    /**
     * Extract a specific part from address string
     * @param address Full address
     * @param part One of: house, area, city, pincode, landmark
     * @return Extracted value or "N/A"
     */
    public static String getAddressPart(String address, String part) {
        if (address == null || address.trim().isEmpty()) {
            return "N/A";
        }

        // Define regex patterns for each part
        Map<String, Pattern> patterns = new HashMap<>();
        patterns.put("house", Pattern.compile("house\\s*(no\\.?|number)?\\s*[:#]?\\s*([^,.\\n]+)", Pattern.CASE_INSENSITIVE));
        patterns.put("area", Pattern.compile("(?:area|locality|sector)\\s*[:]?\\s*([^,.\\n]+)", Pattern.CASE_INSENSITIVE));
        patterns.put("city", Pattern.compile("(?:city|town)\\s*[:]?\\s*([^,.\\n]+)", Pattern.CASE_INSENSITIVE));
        patterns.put("pincode", Pattern.compile("(?:pincode|pin\\s*code|zip\\s*code)\\s*[:#]?\\s*(\\d{6})", Pattern.CASE_INSENSITIVE));
        patterns.put("landmark", Pattern.compile("(?:near|landmark|opposite|beside)\\s*[:]?\\s*([^,.\\n]+)", Pattern.CASE_INSENSITIVE));

        // Try pattern matching first
        if (patterns.containsKey(part)) {
            Pattern pattern = patterns.get(part);
            Matcher matcher = pattern.matcher(address);
            if (matcher.find()) {
                if (matcher.groupCount() >= 2 && matcher.group(2) != null) {
                    return matcher.group(2).trim();
                } else if (matcher.groupCount() >= 1 && matcher.group(1) != null) {
                    return matcher.group(1).trim();
                }
            }
        }

        // Fallback: Parse comma-separated parts
        String[] parts = address.split(",");
        for (int i = 0; i < parts.length; i++) {
            parts[i] = parts[i].trim();
        }

        switch (part) {
            case "house":
                return parts.length > 0 ? parts[0] : "N/A";
            case "area":
                return parts.length > 1 ? parts[1] : "N/A";
            case "city":
                if (parts.length > 2) {
                    return parts[2];
                }
                for (String p : parts) {
                    if (p.toLowerCase().contains("city") || p.toLowerCase().contains("town")) {
                        return p.replaceAll("(?i)(city|town)", "").trim();
                    }
                }
                return "N/A";
            case "pincode":
                Pattern pincodePattern = Pattern.compile("\\b(\\d{6})\\b");
                Matcher pincodeMatcher = pincodePattern.matcher(address);
                return pincodeMatcher.find() ? pincodeMatcher.group(1) : "N/A";
            case "landmark":
                for (String p : parts) {
                    if (p.toLowerCase().contains("near") || p.toLowerCase().contains("opposite") ||
                        p.toLowerCase().contains("beside") || p.toLowerCase().contains("landmark")) {
                        return p.replaceAll("(?i)(near|opposite|beside|landmark)", "").trim();
                    }
                }
                return parts.length > 3 ? parts[3] : "N/A";
            default:
                return "N/A";
        }
    }
}
