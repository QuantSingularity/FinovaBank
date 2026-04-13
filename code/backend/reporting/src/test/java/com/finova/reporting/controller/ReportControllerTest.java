package com.finova.reporting.controller;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.finova.reporting.config.SecurityConfig;
import com.finova.reporting.model.Report;
import com.finova.reporting.service.ReportService;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ReportController.class)
@Import(SecurityConfig.class)
public class ReportControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private ReportService reportService;

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
  public void contextLoads() {
    assert mockMvc != null;
  }

  @Test
  public void testGetReportById() throws Exception {
    Report report = new Report();
    report.setId(1L);
    report.setReportType("ACCOUNT_SUMMARY");
    report.setCustomerId("customer1");
    report.setStatus(Report.ReportStatus.COMPLETED);

    when(reportService.getReportById(1L)).thenReturn(report);

    mockMvc
        .perform(get("/api/reports/{id}", 1L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(1)))
        .andExpect(jsonPath("$.reportType", is("ACCOUNT_SUMMARY")))
        .andExpect(jsonPath("$.status", is("COMPLETED")));

    verify(reportService, times(1)).getReportById(1L);
  }

  @Test
  public void testGetReportById_NotFound() throws Exception {
    when(reportService.getReportById(99L)).thenReturn(null);

    mockMvc
        .perform(get("/api/reports/{id}", 99L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());

    verify(reportService, times(1)).getReportById(99L);
  }

  @Test
  public void testGetAllReports() throws Exception {
    Report r1 = new Report();
    r1.setId(1L);
    r1.setReportType("TYPE_A");
    r1.setCustomerId("c1");

    Report r2 = new Report();
    r2.setId(2L);
    r2.setReportType("TYPE_B");
    r2.setCustomerId("c2");

    List<Report> reports = Arrays.asList(r1, r2);
    when(reportService.getAllReports()).thenReturn(reports);

    mockMvc
        .perform(get("/api/reports").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(2)))
        .andExpect(jsonPath("$[0].reportType", is("TYPE_A")))
        .andExpect(jsonPath("$[1].reportType", is("TYPE_B")));

    verify(reportService, times(1)).getAllReports();
  }

  @Test
  public void testCreateReport() throws Exception {
    Report reportToCreate = new Report();
    reportToCreate.setReportType("TRANSACTION_HISTORY");
    reportToCreate.setCustomerId("customer123");

    Report createdReport = new Report();
    createdReport.setId(3L);
    createdReport.setReportType("TRANSACTION_HISTORY");
    createdReport.setCustomerId("customer123");
    createdReport.setStatus(Report.ReportStatus.COMPLETED);

    when(reportService.createReport(any(Report.class))).thenReturn(createdReport);

    mockMvc
        .perform(
            post("/api/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(reportToCreate)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id", is(3)))
        .andExpect(jsonPath("$.status", is("COMPLETED")));

    verify(reportService, times(1)).createReport(any(Report.class));
  }
}
