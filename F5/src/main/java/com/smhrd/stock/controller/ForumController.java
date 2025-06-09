package com.smhrd.stock.controller;

import java.io.File;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.stock.dto.ForumDTO;
import com.smhrd.stock.dto.ForumListResponse;
import com.smhrd.stock.entity.StockForum;
import com.smhrd.stock.service.ForumRecosService;
import com.smhrd.stock.service.ForumService;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/forum")
public class ForumController {

    private final ForumService service;
    private final ForumRecosService recoService;

    @Autowired
    public ForumController(ForumService service, ForumRecosService recoService) {
        this.service = service;
        this.recoService = recoService;
    }

    // 업로드 및 서빙 경로 통일: OS별 구분자 자동 적용
    private final String uploadDir;

    {
        String userHome = System.getProperty("user.home");
        Path uploadPath = Paths.get(userHome, "Desktop", "uploads");
        uploadDir = uploadPath.toString() + File.separator;
    }

    // 1. 글 목록 조회
    @GetMapping("/list")
    public ForumListResponse getForumList() {
        return service.getForumListWithCount();
    }

    // 2. 글 등록 (파일 포함 가능)
    @PostMapping(value = "/insert", consumes = {"multipart/form-data"})
    public ResponseEntity<String> insertForum(
            @RequestPart("forum_title") String forumTitle,
            @RequestPart("forum_content") String forumContent,
            @RequestPart(value = "forum_file", required = false) MultipartFile forumFile,
            @RequestPart("stock_code") String stockCode,
            @RequestPart("user_id") String userId
    ) {
        System.out.println("게시글 등록 요청 시작");

        StockForum vo = new StockForum();
        vo.setForum_title(forumTitle);
        vo.setForum_content(forumContent);
        vo.setStock_code(stockCode);
        vo.setUser_id(userId);

        System.out.println("입력 받은 값 - 제목: " + forumTitle + ", 내용 길이: " + (forumContent != null ? forumContent.length() : 0)
                + ", 주식코드: " + stockCode + ", 사용자ID: " + userId);

        if (forumFile != null && !forumFile.isEmpty()) {
            System.out.println("파일이 포함되어 있음. 파일명: " + forumFile.getOriginalFilename());

            try {
                Path directoryPath = Paths.get(uploadDir);
                Files.createDirectories(directoryPath);
                System.out.println("업로드 폴더 존재 여부 확인 및 생성 완료: " + uploadDir);

                String originalName = forumFile.getOriginalFilename();
                String safeName = originalName.replaceAll("[^a-zA-Z0-9.\\-]", "_");
                String fileName = System.currentTimeMillis() + "_" + safeName;

                Path fullPath = directoryPath.resolve(fileName);

                forumFile.transferTo(fullPath.toFile());
                System.out.println("파일 저장 완료: " + fullPath.toAbsolutePath());

                vo.setForum_file(fileName);
            } catch (Exception e) {
                System.out.println("파일 업로드 중 예외 발생:");
                e.printStackTrace();
                return ResponseEntity.status(500).body("파일 업로드 실패");
            }
        } else {
            System.out.println("업로드된 파일 없음");
        }

        System.out.println("게시글 DB 저장 시도");
        service.boardInsert(vo);
        System.out.println("게시글 저장 완료");

        return ResponseEntity.ok("Insert success");
    }

    @PutMapping(value = "/update/{forumIdx}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateForum(
            @PathVariable("forumIdx") Integer forumIdx,
            @RequestParam("forum_title") String forumTitle,
            @RequestParam("forum_content") String forumContent,
            @RequestParam(value = "forum_file", required = false) MultipartFile forumFile,
            @RequestParam("stock_code") String stockCode,
            @RequestParam("user_id") String userId
    ) {
        System.out.println("=== 게시글 수정 요청 시작 ===");
        System.out.println("forumIdx: " + forumIdx);
        System.out.println("forum_title: " + forumTitle);
        System.out.println("forum_content 길이: " + (forumContent != null ? forumContent.length() : 0));
        System.out.println("stock_code: " + stockCode);
        System.out.println("user_id: " + userId);
        System.out.println("첨부파일 있음? " + (forumFile != null ? forumFile.getOriginalFilename() : "없음"));

        StockForum vo = new StockForum();
        vo.setForum_idx(forumIdx);
        vo.setForum_title(forumTitle);
        vo.setForum_content(forumContent);
        vo.setStock_code(stockCode);
        vo.setUser_id(userId);

        if (forumFile != null && !forumFile.isEmpty()) {
            try {
                Path directoryPath = Paths.get(uploadDir);
                Files.createDirectories(directoryPath);

                String originalName = forumFile.getOriginalFilename();
                String safeName = originalName.replaceAll("[^a-zA-Z0-9.\\-]", "_");
                String fileName = System.currentTimeMillis() + "_" + safeName;

                Path fullPath = directoryPath.resolve(fileName);
                forumFile.transferTo(fullPath.toFile());

                vo.setForum_file(fileName);
                System.out.println("파일 저장 완료: " + fileName);
            } catch (Exception e) {
                System.err.println("파일 업로드 실패:");
                e.printStackTrace();
                return ResponseEntity.status(500).body("파일 업로드 실패");
            }
        }

        try {
            service.boardUpdate(vo);
            System.out.println("게시글 수정 완료");
        } catch (Exception e) {
            System.err.println("게시글 수정 중 예외 발생:");
            e.printStackTrace();
            return ResponseEntity.status(500).body("게시글 수정 실패");
        }

        return ResponseEntity.ok("Update success");
    }

    // 4. 글 삭제
    @DeleteMapping("/delete/{forumIdx}")
    public ResponseEntity<String> deleteForum(@PathVariable("forumIdx") Integer forumIdx) {
        System.out.println("[deleteForum] 삭제 요청 받은 게시글 ID: " + forumIdx);

        try {
            service.boardDelete(forumIdx);
            System.out.println("[deleteForum] 삭제 성공 - 게시글 ID: " + forumIdx);
            return ResponseEntity.ok("Delete success");
        } catch (Exception e) {
            System.err.println("[deleteForum] 삭제 실패 - 게시글 ID: " + forumIdx);
            e.printStackTrace();
            return ResponseEntity.status(500).body("삭제 중 서버 오류 발생");
        }
    }

    // 5. 글 상세 조회
    @GetMapping("/detail/{forumId}")
    public ResponseEntity<?> getForumDetail(
            @PathVariable Integer forumId,
            @RequestParam String userId  // userId를 받아야 추천 여부 체크 가능
    ) {
        ForumDTO dto = service.getForumDetailWithComments(forumId);
        if (dto == null) {
            return ResponseEntity.status(404).body("게시글을 찾을 수 없습니다.");
        }
        
        // 추천 여부 조회
        boolean hasRecommended = recoService.hasUserRecommended(userId, forumId);
        dto.setUserRecommended(hasRecommended);
        
        return ResponseEntity.ok(dto);
    }


    // 이미지 서빙
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path file = Paths.get(uploadDir).resolve(filename).normalize();

            System.out.println("이미지 요청: " + filename);
            System.out.println("파일 경로: " + file.toAbsolutePath());
            System.out.println("파일 존재 여부: " + Files.exists(file));
            System.out.println("읽기 가능 여부: " + Files.isReadable(file));

            if (!Files.exists(file) || !Files.isReadable(file)) {
                System.out.println("이미지 파일을 찾을 수 없거나 읽을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(file.toUri());

            String contentType = "image/jpeg";  // 기본값

            if (filename.toLowerCase().endsWith(".png")) {
                contentType = "image/png";
            } else if (filename.toLowerCase().endsWith(".gif")) {
                contentType = "image/gif";
            } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                contentType = "image/jpeg";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            System.out.println("MalformedURLException 발생:");
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/view/{forumIdx}")
    public ResponseEntity<String> increaseViewCount(@PathVariable("forumIdx") Integer forumIdx) {
        service.incrementViewCount(forumIdx);
        return ResponseEntity.ok("조회수 증가 완료");
    }



}
