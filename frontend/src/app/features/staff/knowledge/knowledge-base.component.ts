import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../models/article.model';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './knowledge-base.component.html',
  styleUrl: './knowledge-base.component.css'
})
export class KnowledgeBaseComponent implements OnInit {
  articles: Article[] = [];
  filtered: Article[] = [];
  loading = true;
  searchQuery = '';
  selectedArticle: Article | null = null;

  categories = ['All', 'Software', 'Network', 'Hardware', 'Endpoint Security', 'Application Development', 'Service Request', 'Other'];
  activeCategory = 'All';

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.articleService.getAll().subscribe({
      next: (data) => {
        this.articles = data;
        this.filtered = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.applyFilters();
  }

  filterByCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    this.filtered = this.articles.filter(a => {
      const matchesSearch = !this.searchQuery ||
        a.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.activeCategory === 'All' || a.category === this.activeCategory;
      return matchesSearch && matchesCategory;
    });
  }

  readArticle(article: Article) {
    this.selectedArticle = article;
    this.articleService.incrementViews(article.id).subscribe(updated => {
      const idx = this.articles.findIndex(a => a.id === updated.id);
      if (idx !== -1) { this.articles[idx] = updated; }
    });
  }

  closeArticle() {
    this.selectedArticle = null;
  }
}
