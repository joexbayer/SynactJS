package com.synact.syncserver;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SyncServerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerRefreshPutAndGetBlobFlowWorks() throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "user@example.com",
                      "password": "StrongPass!123",
                      "appId": "plants"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.user.email").value("user@example.com"))
            .andExpect(jsonPath("$.accessToken").isString())
            .andReturn();

        String setCookie = registerResult.getResponse().getHeader(HttpHeaders.SET_COOKIE);
        assertThat(setCookie).contains("synact_refresh=");
        Cookie refreshCookie = registerResult.getResponse().getCookie("synact_refresh");
        assertThat(refreshCookie).isNotNull();

        String accessToken = readJson(registerResult).path("accessToken").asText();
        assertThat(accessToken).isNotBlank();

        MvcResult refreshResult = mockMvc.perform(post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .cookie(refreshCookie)
                .content("""
                    {
                      "appId": "plants"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isString())
            .andReturn();

        String refreshedAccessToken = readJson(refreshResult).path("accessToken").asText();

        mockMvc.perform(put("/v1/sync/blob")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + refreshedAccessToken)
                .content("""
                    {
                      "appId": "plants",
                      "encryptedSnapshot": {
                        "ciphertext": "abc",
                        "iv": "def",
                        "salt": "ghi"
                      },
                      "metadata": {
                        "schemaVersion": 1
                      }
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.appId").value("plants"));

        mockMvc.perform(get("/v1/sync/blob")
                .param("appId", "plants")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + refreshedAccessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.appId").value("plants"))
            .andExpect(jsonPath("$.encryptedSnapshot.ciphertext").value("abc"))
            .andExpect(jsonPath("$.metadata.schemaVersion").value(1));
    }

    @Test
    void refreshWithoutCookieReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Refresh token is missing."));
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
