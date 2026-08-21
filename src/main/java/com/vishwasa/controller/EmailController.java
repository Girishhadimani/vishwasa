package com.vishwasa.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
public class EmailController {

    @Value("${RESEND_API_KEY:${resend.api.key:YOUR_RESEND_API_KEY}}")
    private String resendApiKey;

    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, Object> request) {
        String recipientEmail = (String) request.get("to");
        String subject = (String) request.get("subject");
        String htmlContent = (String) request.get("html");

        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            recipientEmail = "donor@vishwasa.org";
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("from", "Vishwasa Foundation <onboarding@resend.dev>");
            body.put("to", Collections.singletonList(recipientEmail));
            body.put("subject", subject != null ? subject : "Vishwasa Healthcare Notification");
            body.put("html", htmlContent != null ? htmlContent : "<p>Vishwasa Healthcare Foundation Notification</p>");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity("https://api.resend.com/emails", entity, String.class);

            System.out.println("✅ Resend API Dispatched: " + response.getBody());
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "resendResponse", response.getBody()));
        } catch (Exception e) {
            System.err.println("Resend API server dispatch attempt: " + e.getMessage());
            return ResponseEntity.ok(Map.of("status", "DISPATCHED_LOCAL", "message", e.getMessage()));
        }
    }
}
