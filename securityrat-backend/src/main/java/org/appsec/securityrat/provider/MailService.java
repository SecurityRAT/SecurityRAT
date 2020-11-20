package org.appsec.securityrat.provider;

import io.github.jhipster.config.JHipsterProperties;
import java.util.Locale;
import javax.inject.Inject;
import javax.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.CharEncoding;
import org.appsec.securityrat.domain.User;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

@Service
@Slf4j
public class MailService {
    @Inject
    private JavaMailSenderImpl javaMailSender;
    
    @Inject
    private MessageSource messageSource;

    @Inject
    private SpringTemplateEngine templateEngine;
    
    @Inject
    private JHipsterProperties jHipsterProperties;
    
    @Async
    public void sendActivationEmail(User user) {
        log.debug("Sending activation e-mail to '{}'", user.getEmail());
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable("user", user);
        context.setVariable("baseUrl", this.jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/activationEmail", context);
        String subject = messageSource.getMessage("email.activation.title", null, locale);
        this.sendEmail(user.getEmail(), subject, content, false, true);
    }
    
    @Async
    public void sendActivationPassword(User user, String password) {
        log.debug("Sending activation password to '{}'", user.getEmail());
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable("user", user);
        context.setVariable("password", password);
        String content = templateEngine.process("mail/activationPasswordEmail", context);
        String subject = messageSource.getMessage("password.activation.title", null, locale);
        this.sendEmail(user.getEmail(), subject, content, false, true);
    }
    
    @Async
    public void sendPasswordResetMail(User user) {
        log.debug("Sending password reset e-mail to '{}'", user.getEmail());
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable("user", user);
        context.setVariable("baseUrl", this.jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process("mail/passwordResetEmail", context);
        String subject = messageSource.getMessage("email.reset.title", null, locale);
        this.sendEmail(user.getEmail(), subject, content, false, true);
    }
    
    @Async
    private void sendEmail(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        log.debug("Send e-mail[multipart '{}' and html '{}'] to '{}' with subject '{}' and content={}",
                isMultipart, isHtml, to, subject, content);

        // Prepare message using a Spring helper
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, CharEncoding.UTF_8);
            message.setTo(to);
            message.setFrom(this.jHipsterProperties.getMail().getFrom());
            message.setSubject(subject);
            message.setText(content, isHtml);
            javaMailSender.send(mimeMessage);
            log.debug("Sent e-mail to User '{}'", to);
        } catch (Exception e) {
            log.warn("E-mail could not be sent to user '{}', exception is: {}", to, e.getMessage());
        }
    }
}
