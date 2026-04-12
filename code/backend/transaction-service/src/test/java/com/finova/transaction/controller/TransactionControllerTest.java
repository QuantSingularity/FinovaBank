package com.finova.transaction.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.finova.transaction.model.Transaction;
import com.finova.transaction.service.TransactionService;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TransactionController.class)
public class TransactionControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private TransactionService transactionService;

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
  public void testGetTransactionById() throws Exception {
    Transaction transaction = new Transaction();
    transaction.setId(1L);
    transaction.setAccountId(101L);
    transaction.setAmount(new BigDecimal("50.00"));
    transaction.setDescription("Coffee");
    transaction.setType("DEBIT");

    when(transactionService.getTransactionById(1L)).thenReturn(transaction);

    mockMvc
        .perform(get("/api/transactions/{id}", 1L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(1)))
        .andExpect(jsonPath("$.accountId", is(101)))
        .andExpect(jsonPath("$.description", is("Coffee")));

    verify(transactionService, times(1)).getTransactionById(1L);
  }

  @Test
  public void testGetAllTransactions() throws Exception {
    Transaction tx1 = new Transaction();
    tx1.setId(1L);
    tx1.setDescription("Coffee");
    tx1.setAmount(new BigDecimal("50.00"));
    tx1.setAccountId(1L);
    tx1.setType("DEBIT");

    Transaction tx2 = new Transaction();
    tx2.setId(2L);
    tx2.setDescription("Salary");
    tx2.setAmount(new BigDecimal("2000.00"));
    tx2.setAccountId(1L);
    tx2.setType("CREDIT");

    List<Transaction> transactions = Arrays.asList(tx1, tx2);

    when(transactionService.getAllTransactions()).thenReturn(transactions);

    mockMvc
        .perform(get("/api/transactions").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].description", is("Coffee")))
        .andExpect(jsonPath("$[1].description", is("Salary")));

    verify(transactionService, times(1)).getAllTransactions();
  }

  @Test
  public void testCreateTransaction() throws Exception {
    Transaction transactionToCreate = new Transaction();
    transactionToCreate.setAccountId(102L);
    transactionToCreate.setAmount(new BigDecimal("100.00"));
    transactionToCreate.setDescription("Grocery");
    transactionToCreate.setType("DEBIT");

    Transaction createdTransaction = new Transaction();
    createdTransaction.setId(3L);
    createdTransaction.setAccountId(102L);
    createdTransaction.setAmount(new BigDecimal("100.00"));
    createdTransaction.setDescription("Grocery");
    createdTransaction.setType("DEBIT");

    when(transactionService.createTransaction(any(Transaction.class)))
        .thenReturn(createdTransaction);

    mockMvc
        .perform(
            post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(transactionToCreate)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id", is(3)))
        .andExpect(jsonPath("$.description", is("Grocery")));

    verify(transactionService, times(1)).createTransaction(any(Transaction.class));
  }
}
