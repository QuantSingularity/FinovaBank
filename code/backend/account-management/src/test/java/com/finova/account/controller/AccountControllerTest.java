package com.finova.account.controller;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.finova.account.AccountManagementApplication;
import com.finova.account.config.SecurityConfig;
import com.finova.account.dto.AccountCreateRequest;
import com.finova.account.dto.AccountResponse;
import com.finova.account.dto.AccountUpdateRequest;
import com.finova.account.model.Account;
import com.finova.account.service.AccountService;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AccountController.class)
@ContextConfiguration(classes = AccountManagementApplication.class)
@Import(SecurityConfig.class)
public class AccountControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private AccountService accountService;

  private static final ObjectMapper objectMapper = new ObjectMapper();

  static {
    objectMapper.registerModule(new JavaTimeModule());
  }

  private static String asJsonString(final Object obj) {
    try {
      return objectMapper.writeValueAsString(obj);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private AccountResponse buildResponse(Long id, String accountNumber) {
    return AccountResponse.builder()
        .id(id)
        .accountNumber(accountNumber)
        .balance(new BigDecimal("1000.00"))
        .customerId("customer1")
        .accountName("Test Account")
        .accountType(Account.AccountType.CHECKING)
        .status(Account.AccountStatus.ACTIVE)
        .currency("USD")
        .build();
  }

  @Test
  public void contextLoads() {
    assert (mockMvc != null);
  }

  @Test
  @WithMockUser(roles = {"CUSTOMER"})
  public void testGetAccountById() throws Exception {
    AccountResponse response = buildResponse(1L, "1234567890");
    when(accountService.getAccountById(1L)).thenReturn(response);

    mockMvc
        .perform(get("/api/accounts/{id}", 1L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(1)))
        .andExpect(jsonPath("$.accountNumber", is("1234567890")));

    verify(accountService, times(1)).getAccountById(1L);
  }

  @Test
  @WithMockUser(roles = {"EMPLOYEE"})
  public void testGetAllAccounts() throws Exception {
    AccountResponse r1 = buildResponse(1L, "111");
    AccountResponse r2 = buildResponse(2L, "222");
    Page<AccountResponse> page = new PageImpl<>(Arrays.asList(r1, r2));

    when(accountService.getAllAccounts(any(Pageable.class), any(), any())).thenReturn(page);

    mockMvc
        .perform(get("/api/accounts").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content", hasSize(2)))
        .andExpect(jsonPath("$.content[0].accountNumber", is("111")))
        .andExpect(jsonPath("$.content[1].accountNumber", is("222")));

    verify(accountService, times(1)).getAllAccounts(any(Pageable.class), any(), any());
  }

  @Test
  @WithMockUser(roles = {"EMPLOYEE"})
  public void testCreateAccount() throws Exception {
    AccountCreateRequest request = new AccountCreateRequest();
    request.setCustomerId("customer123");
    request.setAccountName("My Checking");
    request.setAccountType(Account.AccountType.CHECKING);
    request.setCurrency("USD");
    request.setInitialDeposit(new BigDecimal("500.00"));

    AccountResponse response = AccountResponse.builder()
        .id(2L)
        .accountNumber("9876543210")
        .balance(new BigDecimal("500.00"))
        .customerId("customer123")
        .accountName("My Checking")
        .accountType(Account.AccountType.CHECKING)
        .status(Account.AccountStatus.ACTIVE)
        .currency("USD")
        .build();

    when(accountService.createAccount(any(AccountCreateRequest.class))).thenReturn(response);

    mockMvc
        .perform(
            post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id", is(2)))
        .andExpect(jsonPath("$.accountNumber", is("9876543210")));

    verify(accountService, times(1)).createAccount(any(AccountCreateRequest.class));
  }

  @Test
  @WithMockUser(roles = {"EMPLOYEE"})
  public void testUpdateAccount() throws Exception {
    AccountUpdateRequest request = new AccountUpdateRequest();
    request.setAccountName("Updated Account");

    AccountResponse response = AccountResponse.builder()
        .id(1L)
        .accountNumber("1234567890")
        .balance(new BigDecimal("1500.00"))
        .customerId("customer1")
        .accountName("Updated Account")
        .accountType(Account.AccountType.CHECKING)
        .status(Account.AccountStatus.ACTIVE)
        .currency("USD")
        .build();

    when(accountService.updateAccount(eq(1L), any(AccountUpdateRequest.class))).thenReturn(response);

    mockMvc
        .perform(
            put("/api/accounts/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(1)))
        .andExpect(jsonPath("$.accountName", is("Updated Account")));

    verify(accountService, times(1)).updateAccount(eq(1L), any(AccountUpdateRequest.class));
  }

  @Test
  @WithMockUser(roles = {"MANAGER"})
  public void testCloseAccount() throws Exception {
    doNothing().when(accountService).closeAccount(eq(1L), any());

    mockMvc
        .perform(delete("/api/accounts/{id}", 1L).param("reason", "Customer request"))
        .andExpect(status().isNoContent());

    verify(accountService, times(1)).closeAccount(eq(1L), any());
  }
}
