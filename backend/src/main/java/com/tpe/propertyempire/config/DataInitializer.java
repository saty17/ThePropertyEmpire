package com.tpe.propertyempire.config;

import com.tpe.propertyempire.entity.User;
import com.tpe.propertyempire.enums.Role;
import com.tpe.propertyempire.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String ADMIN_TPE_ID = "TPE0000001";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name}")
    private String adminName;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByTpeId(ADMIN_TPE_ID)) {
            log.info("Admin user already exists with TPE ID: {}", ADMIN_TPE_ID);
            return;
        }

        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        if (existingAdmin.isPresent()) {
            User admin = existingAdmin.get();
            admin.setTpeId(ADMIN_TPE_ID);
            if (admin.getCountryCode() == null) {
                admin.setCountryCode("+91");
            }
            userRepository.save(admin);
            log.info("Admin user migrated to new TPE ID: {}", ADMIN_TPE_ID);
            return;
        }

        User admin = User.builder()
                .fullName(adminName)
                .email(adminEmail)
                .countryCode("+91")
                .mobile("0000000000")
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .tpeId(ADMIN_TPE_ID)
                .enabled(true)
                .build();

        userRepository.save(admin);
        log.info("Admin user created: {} ({})", adminEmail, ADMIN_TPE_ID);
    }
}
