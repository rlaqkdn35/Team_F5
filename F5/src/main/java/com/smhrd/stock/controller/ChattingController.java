package com.smhrd.stock.controller;

import com.smhrd.stock.entity.Chatting;
import com.smhrd.stock.service.ChattingService;
import com.smhrd.stock.service.CroomService;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory; // 로거 임포트

@RestController // 이 클래스가 RESTful 웹 서비스 컨트롤러임을 명시. @ResponseBody가 모든 메서드에 자동으로 적용됨.
@RequestMapping("/chat") // 이 컨트롤러의 모든 핸들러 메서드에 대한 기본 URL 경로
public class ChattingController {

    private static final Logger logger = LoggerFactory.getLogger(ChattingController.class);

    private final ChattingService chattingService; // ChattingService 주입 (생성자 주입 방식 권장)

	private final CroomService croomService;

    // 생성자 주입 (Lombok의 @RequiredArgsConstructor를 사용하면 이 생성자 코드는 자동으로 생성됨)
    public ChattingController(ChattingService chattingService, CroomService croomService) {
        this.chattingService = chattingService;
        this.croomService = croomService;
    }
    
    /**
     * 종목 코드(stockCode)를 통해 해당 종목에 연결된 채팅방의 croom_idx를 조회하거나 생성합니다.
     * GET /F5/chat/room-id/{stockCode}
     * @param stockCode 조회할 종목 코드
     * @return Map containing "croomIdx" if found/created, or error message
     */
    @GetMapping("/room-id/{stockCode}")
    public ResponseEntity<Map<String, Object>> getCroomIdxByStockCode(@PathVariable("stockCode") String stockCode) {
        Map<String, Object> response = new HashMap<>();
        try {
            // ChattingService를 통해 croomIdx를 조회하거나 새로 생성
        	Integer croomIdx = croomService.getOrCreateCroomIdxByStockCode(stockCode);

            if (croomIdx != null) {
                response.put("success", true);
                response.put("croomIdx", croomIdx);
                logger.info("종목 코드 '{}'에 대한 채팅방 ID '{}' 조회/생성 성공", stockCode, croomIdx);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "해당 종목 코드에 매핑된 채팅방 ID를 찾거나 생성할 수 없습니다.");
                logger.warn("종목 코드 '{}'에 대한 채팅방 ID를 찾거나 생성할 수 없습니다.", stockCode);
                return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR); // 이 경우는 서비스 로직에서 null 반환 안되게 방어
            }
        } catch (Exception e) {
            logger.error("종목 코드 '{}'로 채팅방 ID 조회/생성 중 오류 발생: {}", stockCode, e.getMessage(), e);
            response.put("success", false);
            response.put("message", "채팅방 ID 조회/생성 중 서버 오류 발생: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 채팅방의 채팅 이력을 조회합니다.
     * GET /chat/history/{prj_idx}
     * @param prj_idx 프로젝트 인덱스 (채팅방 인덱스에 매핑)
     * @return 채팅 메시지 목록과 성공 여부를 포함하는 응답
     */
    @GetMapping("/history/{croomIdx}")
    public ResponseEntity<Map<String, Object>> chatList(@PathVariable("croomIdx") int croomIdx) {
        try {
            // ChattingService를 통해 채팅 이력 조회
            List<Chatting> chatList = chattingService.getChatHistory(croomIdx);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messages", chatList);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("채팅 목록 조회 실패: {}", e.getMessage(), e); // 에러 로그에 스택 트레이스 포함
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "채팅 목록 조회 실패: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 채팅방에 업로드된 파일 목록을 조회합니다.
     * GET /chat/files?croom_idx={croom_idx}
     * @param croom_idx 채팅방 인덱스
     * @return 파일 정보가 포함된 채팅 메시지 목록
     */
    @GetMapping("/files")
    public ResponseEntity<List<Chatting>> getChatFiles(@RequestParam("croomIdx") Integer croomIdx) {
        try {
            // ChattingService를 통해 파일 목록 조회
            List<Chatting> files = chattingService.getChatFiles(croomIdx);
            return new ResponseEntity<>(files, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("채팅 파일 목록 조회 실패: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 업로드된 파일을 다운로드합니다.
     * GET /chat/fileDownload?file_url={file_url}
     * @param file_url 다운로드할 파일의 상대 URL
     * @return 파일 리소스
     * @throws IOException 파일 처리 중 발생할 수 있는 예외
     */
    @GetMapping("/fileDownload")
    public ResponseEntity<Resource> downloadFile(@RequestParam("file_url") String file_url) throws IOException {
        // 파일이 저장된 실제 경로 (운영 환경에 따라 변경 필요)
        String basePath = "C:/Users/smhrd/git/mz_company_test/MZ/src/main/webapp/";
        String relativePath = "resources/workFile/";
        Path fullPath = Paths.get(basePath, relativePath, file_url); // Path 객체로 경로 조립

        File file = fullPath.toFile(); // Path 객체를 File 객체로 변환

        if (!file.exists() || !file.canRead()) {
            logger.warn("파일을 찾을 수 없거나 읽을 수 없습니다: {}", fullPath);
            return ResponseEntity.notFound().build(); // 404 Not Found 응답
        }

        Resource resource = new FileSystemResource(file); // 파일을 Resource로 래핑

        HttpHeaders headers = new HttpHeaders();
        // 파일 이름을 UTF-8로 인코딩하고, 공백을 %20으로 변환하여 RFC 6266 규격에 맞춤
        String encodedFileName = URLEncoder.encode(file.getName(), "UTF-8").replaceAll("\\+", "%20");
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"");
        headers.add(HttpHeaders.CONTENT_TYPE, Files.probeContentType(file.toPath())); // 파일의 MIME 타입 자동 감지

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length()) // 파일 길이 설정
                .body(resource); // 파일 리소스 반환
    }

    /**
     * 채팅 메시지를 저장합니다. (웹소켓을 통한 실시간 메시지와는 별개로, HTTP 요청으로도 저장 가능)
     * POST /chat/message
     * @param chatMessage 저장할 Chatting 엔티티
     * @return 성공 또는 실패 메시지
     */
    @PostMapping("/message")
    public ResponseEntity<String> messageSave(@RequestBody Chatting chatMessage) {
        try {
            logger.info("메시지 저장 요청: {}", chatMessage);
            chattingService.saveChatMessage(chatMessage); // Service를 통해 메시지 저장
            logger.info("메시지 저장 성공: {}", chatMessage);
            return new ResponseEntity<>("success", HttpStatus.OK);
        } catch (Exception e) {
            logger.error("메시지 저장 실패: {}", e.getMessage(), e);
            return new ResponseEntity<>("error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 채팅 파일(이미지, 문서 등)을 업로드하고 파일 정보를 DB에 저장합니다.
     * POST /chat/fileUpload
     * @param file 업로드할 파일
     * @param croom_idx 채팅방 인덱스
     * @param chatter 파일 업로더의 ID 또는 닉네임
     * @return 업로드된 파일의 URL 또는 에러 메시지
     */
    @PostMapping("/fileUpload")
    public ResponseEntity<?> uploadChatFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("croomIdx") Integer croomIdx,
            @RequestParam("chatter") String chatter
    ) {
        try {
            // 파일이 저장될 물리적 경로 (운영 환경에 따라 변경 필요)
            String uploadDir = Paths.get("C:", "Users", "smhrd", "git", "mz_company_test", "MZ", "src", "main", "webapp", "resources", "workFile").toString();
            logger.info("파일 저장 시도 경로: {}", uploadDir);

            File dir = new File(uploadDir);
            if (!dir.exists()) { // 디렉토리가 없으면 생성
                boolean result = dir.mkdirs();
                if (result) {
                    logger.info("업로드 디렉토리 생성 성공: {}", uploadDir);
                } else {
                    logger.error("업로드 디렉토리 생성 실패: {}", uploadDir);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("파일 업로드 디렉토리 생성 실패");
                }
            }

            // 파일 이름 안전하게 처리: 특수문자 제거 및 중복 방지를 위한 로직 추가 필요 (예: UUID)
            String originalFilename = file.getOriginalFilename();
            // 파일명에 포함될 수 있는 Windows에서 허용되지 않는 문자를 '_'로 대체
            String safeFilename = originalFilename.replaceAll("[<>:\"/\\\\|?*]", "_");

            Path filePath = Paths.get(uploadDir, safeFilename);

            // 실제 파일 저장
            file.transferTo(filePath.toFile());

            // DB에는 웹에서 접근 가능한 상대 경로로 저장
            String file_url = "/resources/workFile/" + safeFilename;

            // Chatting 엔티티 생성 (Lombok @Builder 사용)
            Chatting chat = Chatting.builder()
                                    .croomIdx(croomIdx)
                                    .chat_id(chatter) // 파일 업로드자의 ID/닉네임
                                    .chatFile(safeFilename) // 파일명 (DB에 저장)
                                    .fileUrl(file_url) // 파일 URL (DB에 저장)
                                    .messageType(Chatting.MessageType.TALK) // 파일 업로드도 TALK 메시지 타입으로 처리
                                    .createdAt(new Timestamp(System.currentTimeMillis())) // 서버 시간으로 생성 시간 설정
                                    .build();

            // ChattingService를 통해 파일 정보 DB 저장
            chattingService.saveChatMessage(chat);

            logger.info("파일 저장 및 DB 기록 성공. 최종 파일 경로: {}, DB 저장 URL: {}", filePath, file_url);
            return ResponseEntity.ok(file_url); // 프론트엔드에 저장된 파일 URL 반환

        } catch (Exception e) {
            logger.error("파일 업로드 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("파일 업로드 실패: " + e.getMessage());
        }
    }
}