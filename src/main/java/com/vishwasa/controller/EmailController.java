package com.vishwasa.controller;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
public class EmailController {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:girishhadimani145@gmail.com}")
    private String senderEmail;

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

        // 1. Try Free Gmail / SMTP JavaMailSender first (Sends to ANY email address for free!)
        if (mailSender != null) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom(senderEmail, "Vishwasa Healthcare Foundation");
                helper.setTo(recipientEmail);
                helper.setSubject(subject != null ? subject : "Vishwasa Healthcare Notification");
                helper.setText(htmlContent != null ? htmlContent : "<p>Vishwasa Notification</p>", true);

                mailSender.send(mimeMessage);
                System.out.println("✅ Gmail SMTP Email Sent Successfully to: " + recipientEmail);
                return ResponseEntity.ok(Map.of("status", "SUCCESS", "provider", "GMAIL_SMTP", "recipient", recipientEmail));
            } catch (Exception e) {
                System.err.println("Gmail SMTP Dispatch Note: " + e.getMessage());
            }
        }

        // 2. Fallback to Resend API
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
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "provider", "RESEND_API", "resendResponse", response.getBody()));
        } catch (Exception e) {
            System.err.println("Resend API fallback note: " + e.getMessage());
            return ResponseEntity.ok(Map.of("status", "DISPATCHED_LOCAL", "recipient", recipientEmail, "message", e.getMessage()));
        }
    }
}
