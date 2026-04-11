package com.finova.loan.controller;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.finova.loan.LoanManagementApplication;
import com.finova.loan.model.Loan;
import com.finova.loan.service.LoanService;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(LoanController.class)
@ContextConfiguration(classes = LoanManagementApplication.class)
public class LoanControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private LoanService loanService;

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

  @Test
  public void contextLoads() throws Exception {
    assert (mockMvc != null);
  }

  @Test
  public void testGetLoanById() throws Exception {
    Loan loan = new Loan();
    loan.setId(1L);
    loan.setAmount(new BigDecimal("5000.00"));
    loan.setStatus(Loan.LoanStatus.APPROVED);
    loan.setCustomerId("customer1");

    when(loanService.getLoanById(1L)).thenReturn(loan);

    mockMvc
        .perform(get("/api/loans/{id}", 1L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(1)))
        .andExpect(jsonPath("$.amount", is(5000.00)))
        .andExpect(jsonPath("$.status", is("APPROVED")));

    verify(loanService, times(1)).getLoanById(1L);
  }

  @Test
  public void testGetAllLoans() throws Exception {
    Loan loan1 = new Loan();
    loan1.setId(1L);
    loan1.setAmount(new BigDecimal("5000.00"));
    loan1.setStatus(Loan.LoanStatus.APPROVED);
    loan1.setCustomerId("customer1");

    Loan loan2 = new Loan();
    loan2.setId(2L);
    loan2.setAmount(new BigDecimal("10000.00"));
    loan2.setStatus(Loan.LoanStatus.PENDING);
    loan2.setCustomerId("customer2");

    List<Loan> loans = Arrays.asList(loan1, loan2);
    when(loanService.getAllLoans()).thenReturn(loans);

    mockMvc
        .perform(get("/api/loans").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].status", is("APPROVED")))
        .andExpect(jsonPath("$[1].status", is("PENDING")));

    verify(loanService, times(1)).getAllLoans();
  }

  @Test
  public void testCreateLoan() throws Exception {
    Loan loanToCreate = new Loan();
    loanToCreate.setAmount(new BigDecimal("7500.00"));
    loanToCreate.setCustomerId("customer123");

    Loan createdLoan = new Loan();
    createdLoan.setId(3L);
    createdLoan.setAmount(new BigDecimal("7500.00"));
    createdLoan.setCustomerId("customer123");
    createdLoan.setStatus(Loan.LoanStatus.PENDING);

    when(loanService.createLoan(any(Loan.class))).thenReturn(createdLoan);

    mockMvc
        .perform(
            post("/api/loans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loanToCreate)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id", is(3)))
        .andExpect(jsonPath("$.status", is("PENDING")));

    verify(loanService, times(1)).createLoan(any(Loan.class));
  }

  @Test
  public void testUpdateLoan() throws Exception {
    Loan loanUpdates = new Loan();
    loanUpdates.setStatus(Loan.LoanStatus.REJECTED);
    loanUpdates.setCustomerId("customer1");
    loanUpdates.setAmount(new BigDecimal("5000.00"));

    Loan updatedLoan = new Loan();
    updatedLoan.setId(1L);
    updatedLoan.setAmount(new BigDecimal("5000.00"));
    updatedLoan.setStatus(Loan.LoanStatus.REJECTED);
    updatedLoan.setCustomerId("customer1");

    when(loanService.updateLoan(eq(1L), any(Loan.class))).thenReturn(updatedLoan);

    mockMvc
        .perform(
            put("/api/loans/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loanUpdates)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(1)))
        .andExpect(jsonPath("$.status", is("REJECTED")));

    verify(loanService, times(1)).updateLoan(eq(1L), any(Loan.class));
  }

  @Test
  public void testDeleteLoan() throws Exception {
    doNothing().when(loanService).deleteLoan(1L);

    mockMvc
        .perform(delete("/api/loans/{id}", 1L))
        .andExpect(status().isNoContent());

    verify(loanService, times(1)).deleteLoan(1L);
  }
}
