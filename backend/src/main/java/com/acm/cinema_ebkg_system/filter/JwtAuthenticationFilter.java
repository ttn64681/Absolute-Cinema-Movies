package com.acm.cinema_ebkg_system.filter;

import com.acm.cinema_ebkg_system.util.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * JWT Authentication Filter - Validates JWT tokens on every request
 * 
 * This filter intercepts all requests and validates JWT tokens from the Authorization header.
 * It sets the authentication context for Spring Security.
 * 
 * Process Flow:
 * 1. Extract JWT token from Authorization header (Bearer token)
 * 2. Validate token signature and expiration
 * 3. Extract user information (email, userId, role)
 * 4. Set Spring Security context with authenticated user
 * 
 * Security Features:
 * - Token validation before processing any request
 * - Automatic user authentication for Spring Security
 * - Role-based access control support
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                   @NonNull HttpServletResponse response, 
                                   @NonNull FilterChain chain) throws ServletException, IOException {
        
        // Step 1: Extract JWT token from Authorization header
        String authHeader = request.getHeader("Authorization");
        
        String token = null;
        String userEmail = null;

        // Step 2: Check if Authorization header exists and starts with "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer " prefix
            
            try {
                // Step 3: Extract user information from token
                userEmail = jwtUtil.getUsernameFromToken(token);
                jwtUtil.getUserIdFromToken(token);
                
                // Step 4: Extract role from token
                String role = jwtUtil.getRoleFromToken(token);
                System.out.println("JwtAuthenticationFilter - Request: " + request.getRequestURI() + ", Role: " + role);
                
                // Step 5: Check if user is not already authenticated
                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    
                    // Create authorities based on role from token
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    if ("ADMIN".equals(role)) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                        authorities.add(new SimpleGrantedAuthority("ROLE_USER")); // Admins can also access user routes
                        System.out.println("JwtAuthenticationFilter - Admin authenticated with ROLE_ADMIN");
                    } else {
                        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                        System.out.println("JwtAuthenticationFilter - User authenticated with ROLE_USER");
                    }
                    
                    // Create authentication token for Spring Security
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userEmail, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Step 6: Set authentication context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
                
            } catch (ExpiredJwtException e) {
                System.out.println("JWT Token has expired");
            } catch (Exception e) {
                System.out.println("Error validating JWT token: " + e.getMessage());
            }
        }
        
        // Continue filter chain
        chain.doFilter(request, response);
    }
}

