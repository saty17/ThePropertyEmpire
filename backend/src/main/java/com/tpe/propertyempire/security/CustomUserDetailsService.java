package com.tpe.propertyempire.security;

import com.tpe.propertyempire.entity.User;
import com.tpe.propertyempire.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String tpeId) throws UsernameNotFoundException {
        User user = userRepository.findByTpeId(tpeId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + tpeId));

        return new org.springframework.security.core.userdetails.User(
                user.getTpeId(),
                user.getPassword(),
                user.isEnabled(),
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
