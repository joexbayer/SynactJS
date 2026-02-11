package com.synact.syncserver.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Deque<Long>> requestHistoryByKey = new ConcurrentHashMap<>();

    public boolean allow(String key, int limit, long windowMillis) {
        long now = Instant.now().toEpochMilli();
        Deque<Long> history = requestHistoryByKey.computeIfAbsent(key, ignored -> new ArrayDeque<>());

        synchronized (history) {
            while (!history.isEmpty() && now - history.peekFirst() >= windowMillis) {
                history.pollFirst();
            }

            if (history.size() >= limit) {
                return false;
            }

            history.addLast(now);
            return true;
        }
    }
}
